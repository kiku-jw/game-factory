// Game Factory - Game Engine
// Core game logic for scene generation and state management

import { RunStore } from './RunStore.js';
import { RngManager } from './RngManager.js';
import { encodeSeed, generateRunRef } from '../../shared/seedCodec.js';
import { DEFAULTS, STATE_CONFIG, DIFFICULTY_MODIFIERS } from '../../shared/constants.js';
import { getDeathNarrative, softenContent } from '../../shared/safetyRules.js';
import type {
  GameState,
  GameSettings,
  Scene,
  Choice,
  Consequence,
  ConsequenceState,
  StartRunInput,
  ThreatLevel,
  ChoiceCost,
} from '../types/index.js';

// =============================================================================
// GAME ENGINE
// =============================================================================

export class GameEngine {
  /**
   * Create a new game run
   */
  static createRun(input: StartRunInput): GameState {
    // Determine settings
    const settings: GameSettings = {
      genre: input.genre || (input.surprise ? this.randomGenre() : 'fantasy'),
      tone: input.tone || DEFAULTS.tone,
      length: input.length || DEFAULTS.length,
      difficulty: input.difficulty || DEFAULTS.difficulty,
      format: input.format || 'quest',
      templateId: input.templateId,
    };

    // Generate identifiers
    const runRef = generateRunRef();
    const seed = encodeSeed(settings);

    // Apply difficulty modifiers
    const diffMod = DIFFICULTY_MODIFIERS[settings.difficulty];
    const hp = DEFAULTS.hp + diffMod.hpBonus;
    const supplies = DEFAULTS.supplies + diffMod.suppliesBonus;

    // Generate initial scene
    const initialScene = this.generateInitialScene(settings, seed);

    // Create state
    const state: GameState = {
      runRef,
      seed,
      turn: 1,
      hp,
      maxHp: hp,
      supplies,
      maxSupplies: DEFAULTS.maxSupplies,
      inventory: [],
      maxInventory: DEFAULTS.maxInventory,
      flags: {},
      chapter: 1,
      progress: 0,
      threatLevel: 'low',
      currentScene: initialScene,
      pendingConsequence: null,
      eventsLog: [],
      itemsFound: [],
      threatsDefeated: 0,
      settings,
      createdAt: Date.now(),
      lastTurnAt: Date.now(),
    };

    // Store it
    RunStore.create(state);

    return state;
  }

  /**
   * Process a player action (choice or consequence)
   */
  static processAction(
    runRef: string,
    actionId: string,
    clientTurn: number
  ): ActionResult {
    const state = RunStore.get(runRef);

    if (!state) {
      return { type: 'error', message: 'Run not found' };
    }

    // Retry-safety check
    if (state.pendingConsequence === null && clientTurn !== state.turn) {
      return {
        type: 'out_of_sync',
        currentTurn: state.turn,
        state,
      };
    }

    // Check if resolving a consequence
    if (state.pendingConsequence) {
      return this.resolveConsequence(state, actionId);
    }

    // Find the choice
    const choice = state.currentScene.choices.find(c => c.id === actionId);
    if (!choice) {
      return { type: 'error', message: 'Invalid choice' };
    }

    // Process the choice
    return this.processChoice(state, choice);
  }

  /**
   * Process a player's choice
   */
  private static processChoice(state: GameState, choice: Choice): ActionResult {
    // Check if choice has risk
    if (choice.risk !== null) {
      const result = RngManager.resolveRisk(
        state.seed,
        state.turn,
        choice.id,
        choice.risk,
        state.settings.difficulty
      );

      if (!result.success) {
        // Generate consequences
        return this.handleFailure(state, choice);
      }
    }

    // Check if choice has cost
    if (choice.cost) {
      this.applyCost(state, choice.cost);
    }

    // Success - advance the game
    return this.advanceGame(state, choice, true);
  }

  /**
   * Handle a failed risk check
   */
  private static handleFailure(state: GameState, choice: Choice): ActionResult {
    // Generate consequence options
    const consequences = this.generateConsequences(state, choice);

    // Check if any consequence is available
    const availableConsequences = consequences.filter(c =>
      this.canPayCost(state, c.cost)
    );

    // If no consequence is available and we're past protected turns, end the run
    if (availableConsequences.length === 0 && state.turn > STATE_CONFIG.protectedTurns) {
      return this.endRun(state, 'defeat');
    }

    // If in protected turns, add a "free" escape option
    if (availableConsequences.length === 0) {
      consequences.push({
        id: 'escape-free',
        label: 'Barely escape (this time)',
        cost: { type: 'turn', amount: 0, effect: 'Lucky escape' },
      });
    }

    // Set pending consequence
    const pendingConsequence: ConsequenceState = {
      failedChoiceId: choice.id,
      consequences: availableConsequences.length > 0 ? availableConsequences : consequences,
      failureNarrative: this.generateFailureNarrative(state, choice),
    };

    state.pendingConsequence = pendingConsequence;
    RunStore.update(state.runRef, { pendingConsequence });

    return {
      type: 'pending_consequence',
      state,
      consequences: pendingConsequence.consequences,
      failureNarrative: pendingConsequence.failureNarrative,
    };
  }

  /**
   * Resolve a pending consequence
   */
  private static resolveConsequence(state: GameState, consequenceId: string): ActionResult {
    if (!state.pendingConsequence) {
      return { type: 'error', message: 'No pending consequence' };
    }

    const consequence = state.pendingConsequence.consequences.find(c => c.id === consequenceId);
    if (!consequence) {
      return { type: 'error', message: 'Invalid consequence' };
    }

    // Apply the cost
    this.applyCost(state, consequence.cost);

    // Clear pending consequence
    state.pendingConsequence = null;

    // Check if player died from cost
    if (state.hp <= 0 || (state.supplies <= 0 && state.threatLevel === 'high')) {
      return this.endRun(state, 'defeat');
    }

    // Find the original choice to continue
    const originalChoice = state.currentScene.choices.find(
      c => c.id === state.pendingConsequence?.failedChoiceId
    );

    // Advance game (as partial success)
    return this.advanceGame(state, originalChoice || null, false);
  }

  /**
   * Advance the game to next scene
   */
  private static advanceGame(
    state: GameState,
    choice: Choice | null,
    fullSuccess: boolean
  ): ActionResult {
    // Update turn
    state.turn += 1;

    // Update progress
    const progressGain = fullSuccess ? 5 : 2;
    state.progress = Math.min(100, state.progress + progressGain);

    // Check for victory
    if (state.progress >= 100) {
      return this.endRun(state, 'victory');
    }

    // Update threat level
    state.threatLevel = this.calculateThreatLevel(state);

    // Generate next scene
    state.currentScene = this.generateNextScene(state, choice);

    // Clear pending consequence
    state.pendingConsequence = null;

    // Log event
    if (choice) {
      state.eventsLog.push(`Turn ${state.turn - 1}: ${choice.label}`);
    }

    // Save state
    RunStore.update(state.runRef, state);

    return {
      type: 'success',
      state,
      narrative: state.currentScene.narrative,
    };
  }

  /**
   * End the run
   */
  static endRun(state: GameState, reason: 'victory' | 'defeat' | 'escape' | 'abandon'): ActionResult {
    const narrative = reason === 'defeat'
      ? getDeathNarrative(state.settings.tone === 'light' ? 'reset' : 'fade', state.seed)
      : this.generateEndingNarrative(state, reason);

    // Calculate rating
    const rating = this.calculateRating(state);

    // Update state
    RunStore.update(state.runRef, {
      progress: reason === 'victory' ? 100 : state.progress,
    });

    return {
      type: 'run_ended',
      state,
      reason,
      narrative,
      rating,
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private static randomGenre(): GameSettings['genre'] {
    const genres: GameSettings['genre'][] = ['fantasy', 'sci-fi', 'mystery', 'horror-lite'];
    return genres[Math.floor(Math.random() * genres.length)];
  }

  private static generateInitialScene(settings: GameSettings, _seed: string): Scene {
    // For spike, use simple hardcoded scenes based on genre
    const scenesByGenre: Record<string, Scene> = {
      'fantasy': {
        chapterId: 1,
        title: 'The Awakening',
        narrative: softenContent(
          'You wake in a dimly lit stone chamber. Ancient runes glow faintly on the walls. ' +
          'A wooden door stands before you, and a narrow passage leads into darkness to your left. ' +
          'Your pack lies nearby with basic supplies.'
        ),
        choices: [
          { id: 'c1', label: 'Examine the glowing runes', risk: null, cost: null },
          { id: 'c2', label: 'Try the wooden door', risk: 70, cost: null },
          { id: 'c3', label: 'Explore the dark passage', risk: 60, cost: null },
        ],
      },
      'sci-fi': {
        chapterId: 1,
        title: 'Emergency Wake',
        narrative: softenContent(
          'Emergency lights pulse red as you emerge from cryo-sleep. The station is silent except ' +
          'for the hum of failing life support. Your heads-up display flickers, showing critical ' +
          'system alerts. A sealed bulkhead blocks the main corridor.'
        ),
        choices: [
          { id: 'c1', label: 'Check the terminal for status', risk: null, cost: null },
          { id: 'c2', label: 'Override the bulkhead seal', risk: 70, cost: null },
          { id: 'c3', label: 'Search for an alternate route', risk: null, cost: { type: 'turn', amount: 1 } },
        ],
      },
      'mystery': {
        chapterId: 1,
        title: 'The Study',
        narrative: softenContent(
          'The old manor\'s study is exactly as described in the letter. Dusty bookshelves line ' +
          'the walls, and a large desk dominates the center. Something feels wrong. The grandfather ' +
          'clock has stopped at midnight, and papers are scattered as if someone left in a hurry.'
        ),
        choices: [
          { id: 'c1', label: 'Examine the scattered papers', risk: null, cost: null },
          { id: 'c2', label: 'Check behind the bookshelf', risk: 70, cost: null },
          { id: 'c3', label: 'Investigate the stopped clock', risk: null, cost: null },
        ],
      },
      'horror-lite': {
        chapterId: 1,
        title: 'The Cabin',
        narrative: softenContent(
          'The cabin looked abandoned from outside, but inside shows signs of recent occupation. ' +
          'A fire still smolders in the hearth. Through the grimy window, fog rolls through the ' +
          'trees. You hear a sound from the basement - rhythmic, like breathing.'
        ),
        choices: [
          { id: 'c1', label: 'Investigate the basement carefully', risk: 60, cost: null },
          { id: 'c2', label: 'Search the main floor first', risk: null, cost: null },
          { id: 'c3', label: 'Barricade the basement door', risk: null, cost: { type: 'supplies', amount: 1 } },
        ],
      },
    };

    return scenesByGenre[settings.genre] || scenesByGenre['fantasy'];
  }

  private static generateNextScene(state: GameState, _previousChoice: Choice | null): Scene {
    // For spike, generate simple continuation scenes
    const baseRisk = state.threatLevel === 'high' ? 60 : state.threatLevel === 'medium' ? 70 : 80;

    return {
      chapterId: Math.floor(state.turn / 5) + 1,
      title: `Scene ${state.turn}`,
      narrative: softenContent(
        `You continue your journey. The ${state.settings.genre === 'sci-fi' ? 'station' : 'area'} ` +
        `feels ${state.threatLevel === 'high' ? 'dangerous' : state.threatLevel === 'medium' ? 'tense' : 'quiet'}. ` +
        `Your supplies are ${state.supplies > 3 ? 'adequate' : 'running low'}.`
      ),
      choices: [
        {
          id: `c${state.turn}-1`,
          label: 'Proceed cautiously',
          risk: baseRisk,
          cost: null,
        },
        {
          id: `c${state.turn}-2`,
          label: 'Take the quick route',
          risk: baseRisk - 20,
          cost: null,
        },
        {
          id: `c${state.turn}-3`,
          label: 'Rest and recover',
          risk: null,
          cost: { type: 'turn', amount: 1, effect: 'Recover 1 HP' },
        },
      ],
    };
  }

  private static generateConsequences(_state: GameState, _choice: Choice): Consequence[] {
    return [
      {
        id: 'f1',
        label: 'Push through (lose 2 HP)',
        cost: { type: 'hp', amount: 2 },
      },
      {
        id: 'f2',
        label: 'Find another way (lose 1 turn)',
        cost: { type: 'turn', amount: 1 },
      },
      {
        id: 'f3',
        label: 'Use supplies to help (lose 1 supply)',
        cost: { type: 'supplies', amount: 1 },
      },
    ];
  }

  private static generateFailureNarrative(state: GameState, choice: Choice): string {
    return softenContent(`Your attempt to "${choice.label}" didn't go as planned. You must decide how to proceed.`);
  }

  private static generateEndingNarrative(state: GameState, reason: string): string {
    const narratives: Record<string, string> = {
      victory: 'Against all odds, you succeeded. Your journey reaches its triumphant conclusion.',
      escape: 'You managed to escape, though the adventure remains unfinished.',
      abandon: 'You chose to abandon this path. Perhaps another time.',
    };
    return softenContent(narratives[reason] || narratives.abandon);
  }

  private static canPayCost(state: GameState, cost: ChoiceCost): boolean {
    switch (cost.type) {
      case 'hp':
        return state.hp > cost.amount; // Must survive
      case 'supplies':
        return state.supplies >= cost.amount;
      case 'item':
        return state.inventory.length > 0;
      case 'turn':
      case 'threat':
        return true; // Always payable
      default:
        return true;
    }
  }

  private static applyCost(state: GameState, cost: ChoiceCost): void {
    switch (cost.type) {
      case 'hp':
        state.hp = Math.max(0, state.hp - cost.amount);
        break;
      case 'supplies':
        state.supplies = Math.max(0, state.supplies - cost.amount);
        break;
      case 'turn':
        // Turn cost handled by progress
        break;
      case 'threat':
        if (state.threatLevel === 'low') state.threatLevel = 'medium';
        else if (state.threatLevel === 'medium') state.threatLevel = 'high';
        break;
      case 'item':
        if (state.inventory.length > 0) {
          state.inventory.pop();
        }
        break;
    }
  }

  private static calculateThreatLevel(state: GameState): ThreatLevel {
    const threatScore = (state.turn * 2) + (10 - state.hp) + (5 - state.supplies);
    const modifier = DIFFICULTY_MODIFIERS[state.settings.difficulty].threatSlowdown;

    const adjustedScore = threatScore * modifier;

    if (adjustedScore < 15) return 'low';
    if (adjustedScore < 30) return 'medium';
    return 'high';
  }

  private static calculateRating(state: GameState): { stars: number; title: string } {
    const score = (
      state.turn * 2 +
      state.progress +
      state.itemsFound.length * 5 +
      state.threatsDefeated * 3
    );

    if (score >= 80) return { stars: 5, title: 'Legendary Hero' };
    if (score >= 60) return { stars: 4, title: 'Veteran Explorer' };
    if (score >= 40) return { stars: 3, title: 'Adventurer' };
    if (score >= 20) return { stars: 2, title: 'Apprentice' };
    return { stars: 1, title: 'Novice' };
  }
}

// =============================================================================
// RESULT TYPES
// =============================================================================

export type ActionResult =
  | { type: 'success'; state: GameState; narrative: string }
  | { type: 'pending_consequence'; state: GameState; consequences: Consequence[]; failureNarrative: string }
  | { type: 'run_ended'; state: GameState; reason: string; narrative: string; rating: { stars: number; title: string } }
  | { type: 'out_of_sync'; currentTurn: number; state: GameState }
  | { type: 'error'; message: string };
