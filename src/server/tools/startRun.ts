// Game Factory - start_run Tool Handler

import { z } from 'zod';
import { GameEngine } from '../engine/GameEngine.js';
import type {
  StartRunInput,
  StartRunOutput,
  StartRunMeta,
  ChoiceOutput,
  GameFormat,
} from '../types/index.js';

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const StartRunInputSchema = z.object({
  templateId: z.string().optional(),
  surprise: z.boolean().optional(),
  genre: z.enum(['fantasy', 'sci-fi', 'mystery', 'horror-lite']).optional(),
  tone: z.enum(['serious', 'light']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
  format: z.enum(['quest', 'arcade', 'puzzle']).optional(),
  prompt: z.string().optional(),
});

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export const startRunToolDefinition = {
  name: 'start_run',
  description: 'Start a new game run. Returns the first scene with choices.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      templateId: {
        type: 'string',
        description: 'ID of a curated template to use',
      },
      surprise: {
        type: 'boolean',
        description: 'Set true for random quick-start',
      },
      genre: {
        type: 'string',
        enum: ['fantasy', 'sci-fi', 'mystery', 'horror-lite'],
        description: 'Game genre',
      },
      tone: {
        type: 'string',
        enum: ['serious', 'light'],
        description: 'Narrative tone',
      },
      length: {
        type: 'string',
        enum: ['short', 'medium', 'long'],
        description: 'Target game length',
      },
      difficulty: {
        type: 'string',
        enum: ['easy', 'normal', 'hard'],
        description: 'Game difficulty',
      },
      format: {
        type: 'string',
        enum: ['quest', 'arcade', 'puzzle'],
        description: 'Game visual/play format (default: quest)',
      },
      prompt: {
        type: 'string',
        description: 'Natural language description of the game to generate',
      },
    },
  },
  annotations: {
    readOnlyHint: false,
    openWorldHint: false,
    destructiveHint: false,
  },
};

// =============================================================================
// HANDLER
// =============================================================================

export function handleStartRun(input: unknown): {
  structuredContent: StartRunOutput;
  _meta: StartRunMeta;
} {
  // Validate input
  const parsed = StartRunInputSchema.parse(input);

  // Create the run
  const state = GameEngine.createRun(parsed as StartRunInput);

  // Format choices for model (concise)
  const choices: ChoiceOutput[] = state.currentScene.choices.map(c => ({
    id: c.id,
    label: c.label,
    risk: c.risk,
    cost: c.cost ? formatCost(c.cost) : null,
  }));

  // Build structuredContent (concise, for model)
  const structuredContent: StartRunOutput = {
    turn: state.turn,
    hp: state.hp,
    supplies: state.supplies,
    threat: state.threatLevel,
    invCount: state.inventory.length,
    choices,
    sceneSummary: state.currentScene.title,
  };

  // Build _meta (rich, for widget only)
  const templateMap: Record<GameFormat, StartRunMeta['openai/outputTemplate']> = {
    quest: 'SceneCard',
    arcade: 'ArcadeCard',
    puzzle: 'PuzzleCard',
  };

  const _meta: StartRunMeta = {
    'openai/outputTemplate': templateMap[state.settings.format] ?? 'SceneCard',
    runRef: state.runRef,
    seed: state.seed,
    narrative: state.currentScene.narrative,
    worldName: getWorldName(state.settings.genre),
    chapterTitle: state.currentScene.title,
  };

  return { structuredContent, _meta };
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCost(cost: { type: string; amount: number }): string {
  if (cost.amount === 0) return '';

  switch (cost.type) {
    case 'hp':
      return `${cost.amount} HP`;
    case 'supplies':
      return `${cost.amount} supply`;
    case 'turn':
      return `${cost.amount} turn`;
    case 'threat':
      return 'raises threat';
    case 'item':
      return 'uses item';
    default:
      return cost.type;
  }
}

function getWorldName(genre: string): string {
  const names: Record<string, string> = {
    'fantasy': 'The Ancient Realm',
    'sci-fi': 'Abandoned Station',
    'mystery': 'Thornwood Manor',
    'horror-lite': 'The Forsaken Cabin',
  };
  return names[genre] || 'Unknown World';
}
