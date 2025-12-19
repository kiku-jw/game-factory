// Game Factory Type Definitions

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type Genre = 'fantasy' | 'sci-fi' | 'mystery' | 'horror-lite' | 'cyberpunk' | 'surreal';
export type Tone = 'serious' | 'light';
export type Length = 'short' | 'medium' | 'long';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type ThreatLevel = 'low' | 'medium' | 'high';
export type RunEndReason = 'victory' | 'defeat' | 'escape' | 'abandon';
export type ConsequenceType = 'hp' | 'supplies' | 'turn' | 'threat' | 'item';
export type GameFormat = 'quest' | 'arcade' | 'puzzle';

// =============================================================================
// GAME STATE
// =============================================================================

export interface GameSettings {
  genre: Genre;
  tone: Tone;
  length: Length;
  difficulty: Difficulty;
  format: GameFormat;
  templateId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  usable: boolean;
}

export interface Choice {
  id: string;
  label: string;
  risk: number | null;      // null = safe, number = % chance of success
  cost: ChoiceCost | null;  // null = no cost
}

export interface ChoiceCost {
  type: ConsequenceType;
  amount: number;
  effect?: string;          // Additional effect description
}

export interface Consequence {
  id: string;
  label: string;
  cost: ChoiceCost;
}

export interface ConsequenceState {
  failedChoiceId: string;
  consequences: Consequence[];
  failureNarrative: string;
}

export interface Scene {
  chapterId: number;
  title: string;
  narrative: string;
  choices: Choice[];
}

export interface GameState {
  // Identity
  runRef: string;
  seed: string;

  // Player state
  turn: number;
  hp: number;
  maxHp: number;
  supplies: number;
  maxSupplies: number;
  inventory: InventoryItem[];
  maxInventory: number;
  flags: Record<string, boolean>;

  // Progress
  chapter: number;
  progress: number;           // 0-100
  threatLevel: ThreatLevel;

  // Current state
  currentScene: Scene;
  pendingConsequence: ConsequenceState | null;

  // History (for summary)
  eventsLog: string[];
  itemsFound: string[];
  threatsDefeated: number;

  // Settings
  settings: GameSettings;

  // Timestamps
  createdAt: number;
  lastTurnAt: number;
}

// =============================================================================
// TOOL INPUTS
// =============================================================================

export interface ListTemplatesInput {
  genre?: Genre;
  featured?: boolean;
  limit?: number;
}

export interface StartRunInput {
  templateId?: string;
  surprise?: boolean;
  genre?: Genre;
  tone?: Tone;
  length?: Length;
  difficulty?: Difficulty;
  format?: GameFormat;
  prompt?: string;
}

export interface ActInput {
  runRef: string;
  actionId: string;     // choice_id OR consequence_id
  clientTurn: number;   // For retry-safety
}

export interface EndRunInput {
  runRef: string;
  reason: RunEndReason;
}

export interface ExportChallengeInput {
  runRef: string;
}

// =============================================================================
// TOOL OUTPUTS (structuredContent - concise for model)
// =============================================================================

export interface TemplateInfo {
  id: string;
  name: string;
  genre: Genre;
  difficulty: Difficulty;
}

export interface ListTemplatesOutput {
  templates: TemplateInfo[];
  total: number;
}

export interface ChoiceOutput {
  id: string;
  label: string;
  risk: number | null;
  cost: string | null;    // Simplified for model: "turn" | "1 HP" | null
}

export interface StartRunOutput {
  turn: number;
  hp: number;
  supplies: number;
  threat: ThreatLevel;
  invCount: number;
  choices: ChoiceOutput[];
  sceneSummary: string;
}

export interface ActSuccessOutput {
  outcome: 'success';
  turn: number;
  hp: number;
  supplies: number;
  threat: ThreatLevel;
  invCount: number;
  changes: string;        // "+Keycard, -1 HP"
  choices: ChoiceOutput[];
  sceneSummary: string;
}

export interface ActPendingOutput {
  outcome: 'pending_consequence';
  turn: number;
  consequences: Array<{
    id: string;
    label: string;
  }>;
  failureSummary: string;
}

export interface ActRunEndedOutput {
  outcome: 'run_ended';
  reason: RunEndReason;
  endingSummary: string;
}

export interface ActOutOfSyncOutput {
  outcome: 'out_of_sync';
  currentTurn: number;
  hp: number;
  supplies: number;
  message: string;
}

export type ActOutput = ActSuccessOutput | ActPendingOutput | ActRunEndedOutput | ActOutOfSyncOutput;

export interface RatingInfo {
  stars: number;
  title: string;
}

export interface EndRunOutput {
  turnsSurvived: number;
  itemsFound: number;
  threatsDefeated: number;
  progressReached: number;
  rating: RatingInfo;
  seed: string;
}

export interface ExportChallengeOutput {
  seed: string;
  shareText: string;
}

// =============================================================================
// TOOL META (widget-only, model never sees)
// =============================================================================

export interface StartRunMeta {
  'openai/outputTemplate': 'SceneCard' | 'ArcadeCard' | 'PuzzleCard';
  runRef: string;
  seed: string;
  narrative: string;
  worldName: string;
  chapterTitle: string;
}

export interface ActSuccessMeta {
  'openai/outputTemplate': 'SceneCard';
  runRef: string;
  narrative: string;
  chapterTitle: string;
}

export interface ActPendingMeta {
  'openai/outputTemplate': 'ConsequenceCard';
  runRef: string;
  failureNarrative: string;
}

export interface ActRunEndedMeta {
  'openai/outputTemplate': 'EndRunCard';
  runRef: string;
  endingNarrative: string;
}

export interface EndRunMeta {
  'openai/outputTemplate': 'EndRunCard';
  runRef: string;
  endingNarrative: string;
  itemsList: string[];
  shareText: string;
}

// =============================================================================
// TEMPLATE
// =============================================================================

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  genre: Genre;
  difficulty: Difficulty;
  featured: boolean;

  world: {
    setting: string;
    era: string;
    atmosphere: string;
    tags: string[];
  };

  mechanics: {
    resourcePressure: 'low' | 'medium' | 'high';
    threatEscalation: 'low' | 'medium' | 'high';
    puzzleFrequency: 'none' | 'low' | 'medium';
    npcInteraction: 'none' | 'low' | 'medium';
  };

  safety: {
    maxViolenceLevel: 1 | 2;    // 1=cartoon, 2=action
    forbiddenThemes: string[];
    deathStyle: 'fade' | 'reset';
  };

  initialScene: Scene;

  encounters: {
    threats: string[];
    discoveries: string[];
    puzzles: string[];
  };
}
