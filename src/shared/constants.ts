// Game Factory Constants

// =============================================================================
// GAME DEFAULTS
// =============================================================================

export const DEFAULTS = {
  hp: 10,
  maxHp: 10,
  supplies: 5,
  maxSupplies: 10,
  maxInventory: 8,
  tone: 'light' as const,
  length: 'medium' as const,
  difficulty: 'normal' as const,
} as const;

// =============================================================================
// DIFFICULTY MODIFIERS
// =============================================================================

export const DIFFICULTY_MODIFIERS = {
  easy: {
    hpBonus: 2,
    suppliesBonus: 2,
    riskReduction: 10,    // +10% success chance
    threatSlowdown: 0.7,  // Threat escalates 30% slower
  },
  normal: {
    hpBonus: 0,
    suppliesBonus: 0,
    riskReduction: 0,
    threatSlowdown: 1.0,
  },
  hard: {
    hpBonus: -2,
    suppliesBonus: -1,
    riskReduction: -10,   // -10% success chance
    threatSlowdown: 1.3,  // Threat escalates 30% faster
  },
} as const;

// =============================================================================
// LENGTH SETTINGS
// =============================================================================

export const LENGTH_SETTINGS = {
  short: {
    targetTurns: 15,
    chaptersCount: 3,
  },
  medium: {
    targetTurns: 30,
    chaptersCount: 5,
  },
  long: {
    targetTurns: 50,
    chaptersCount: 8,
  },
} as const;

// =============================================================================
// RISK THRESHOLDS (human-readable)
// =============================================================================

export const RISK_LEVELS = {
  safe: null,     // Always succeeds
  low: 90,        // 90% success
  medium: 70,     // 70% success
  high: 60,       // 60% success
} as const;

// =============================================================================
// RATINGS
// =============================================================================

export const RATINGS = [
  { minScore: 0, stars: 1, title: 'Novice' },
  { minScore: 20, stars: 2, title: 'Apprentice' },
  { minScore: 40, stars: 3, title: 'Adventurer' },
  { minScore: 60, stars: 4, title: 'Veteran Explorer' },
  { minScore: 80, stars: 5, title: 'Legendary Hero' },
] as const;

// =============================================================================
// RATE LIMITS
// =============================================================================

export const RATE_LIMITS = {
  startRun: { max: 10, windowMs: 60 * 60 * 1000 },    // 10 per hour
  act: { max: 100, windowMs: 60 * 60 * 1000 },        // 100 per hour
} as const;

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

export const STATE_CONFIG = {
  runTTL: 4 * 60 * 60 * 1000,     // 4 hours
  cleanupInterval: 30 * 60 * 1000, // Run cleanup every 30 min
  protectedTurns: 3,              // Can't die in first 3 turns
} as const;

// =============================================================================
// SEED FORMAT
// =============================================================================

export const SEED_PREFIX = 'GF';

export const GENRE_CODES: Record<string, string> = {
  'fantasy': 'FAN',
  'sci-fi': 'SCI',
  'mystery': 'MYS',
  'horror-lite': 'HOR',
};

export const TONE_CODES: Record<string, string> = {
  'serious': 'S',
  'light': 'L',
};

export const LENGTH_CODES: Record<string, string> = {
  'short': 'S',
  'medium': 'M',
  'long': 'L',
};
