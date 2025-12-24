// Game Factory Safety Rules - Content filtering for 13+

// =============================================================================
// FORBIDDEN KEYWORDS (Never generated)
// =============================================================================

export const FORBIDDEN_KEYWORDS = [
  // Occult/Spiritual
  'demon', 'satan', 'lucifer', 'devil', 'ouija', 'seance', 'séance',
  'pentagram', 'ritual sacrifice', 'dark ritual', 'summoning circle',
  'necromancy', 'possession', 'exorcism', 'cult', 'occult',

  // Graphic violence
  'gore', 'gory', 'dismember', 'decapitate', 'mutilate', 'torture',
  'disembowel', 'eviscerate', 'bloodbath', 'entrails', 'intestines',

  // Sexual content
  'sexual', 'erotic', 'nude', 'naked', 'seduce', 'intercourse',
  'orgasm', 'genitals', 'breasts', 'pornographic',

  // Self-harm / Suicide
  'suicide', 'suicidal', 'self-harm', 'cut myself', 'kill myself',
  'end my life', 'hang myself',

  // Drugs
  'cocaine', 'heroin', 'meth', 'crack', 'inject drugs', 'overdose',
  'drug dealer', 'drug use',

  // Gambling (framing)
  'bet', 'wager', 'gamble', 'gambling', 'jackpot', 'casino',
  'slot machine', 'poker chips', 'blackjack table',

  // Hate
  'racial slur', 'hate crime', 'nazi', 'white supremac', 'ethnic cleansing',

  // Weapons (real-world specific)
  'ar-15', 'ak-47', 'assault rifle', 'school shooting', 'mass shooting',
] as const;

// =============================================================================
// THEME RESTRICTIONS
// =============================================================================

export const FORBIDDEN_THEMES = [
  'satanism',
  'demonology',
  'human_sacrifice',
  'torture_porn',
  'sexual_violence',
  'child_abuse',
  'real_world_violence',
  'terrorism',
  'self_harm',
  'eating_disorders',
] as const;

// =============================================================================
// SAFE ALTERNATIVES
// =============================================================================

export const SAFE_ALTERNATIVES: Record<string, string> = {
  // Violence softening
  'killed': 'defeated',
  'died': 'fell',
  'blood': 'shadow',
  'corpse': 'remains',
  'dead body': 'fallen figure',

  // Horror softening
  'terrifying': 'unsettling',
  'horrifying': 'disturbing',
  'nightmare': 'bad dream',

  // Death handling
  'you die': 'you collapse',
  'you are killed': 'you are overcome',
};

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  flaggedKeyword?: string;
}

/**
 * Check if content contains forbidden keywords
 */
export function validateContent(content: string): ValidationResult {
  const lowered = content.toLowerCase();

  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (lowered.includes(keyword.toLowerCase())) {
      return {
        valid: false,
        reason: `Contains forbidden keyword`,
        flaggedKeyword: keyword,
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize user input (custom tags, etc.)
 * Strips potential prompt injection and forbidden content
 */
export function sanitizeUserInput(input: string, maxLength = 200): string {
  const sanitized = input
    // Remove potential injection patterns
    .replace(/\[.*?\]/g, '')      // [brackets]
    .replace(/\{.*?\}/g, '')      // {braces}
    .replace(/<.*?>/g, '')        // <tags>
    .replace(/```.*?```/gs, '')   // ```code blocks```
    .replace(/`.*?`/g, '')        // `inline code`
    // Remove control characters
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Limit length
    .slice(0, maxLength)
    .trim();

  // Validate content against forbidden keywords
  const validation = validateContent(sanitized);
  if (!validation.valid) {
    throw new Error(`Input contains forbidden content: ${validation.flaggedKeyword}`);
  }

  return sanitized;
}

/**
 * Sanitize custom tags for template creation
 */
export function sanitizeCustomTags(tags: string[]): string[] {
  return tags
    .slice(0, 3)                              // Max 3 tags
    .map(tag => tag
      .replace(/[^a-zA-Z0-9\s-]/g, '')        // Alphanumeric only
      .slice(0, 20)                            // Max 20 chars each
      .trim()
      .toLowerCase()
    )
    .filter(tag => tag.length > 0)
    .filter(tag => {
      // Check against forbidden keywords
      const validation = validateContent(tag);
      return validation.valid;
    });
}

/**
 * Apply safe alternatives to soften content
 */
export function softenContent(content: string): string {
  let result = content;

  for (const [unsafe, safe] of Object.entries(SAFE_ALTERNATIVES)) {
    const regex = new RegExp(unsafe, 'gi');
    result = result.replace(regex, safe);
  }

  return result;
}

/**
 * Check if a theme is allowed
 */
export function isThemeAllowed(theme: string): boolean {
  return !FORBIDDEN_THEMES.includes(theme as typeof FORBIDDEN_THEMES[number]);
}

// =============================================================================
// DEATH HANDLING
// =============================================================================

export type DeathStyle = 'fade' | 'reset';

export const DEATH_NARRATIVES: Record<DeathStyle, string[]> = {
  fade: [
    'Your vision fades to black...',
    'Exhaustion overtakes you as everything goes dark...',
    'The world grows distant and quiet...',
    'You slip into unconsciousness...',
  ],
  reset: [
    'You wake up, somehow back where you started...',
    'Time seems to rewind as you find yourself at the beginning...',
    'A strange feeling washes over you as reality shifts...',
  ],
};

export function getDeathNarrative(style: DeathStyle, seed: string): string {
  const narratives = DEATH_NARRATIVES[style];
  // Use seed for consistent selection
  const index = Math.abs(hashCode(seed)) % narratives.length;
  return narratives[index];
}

// Simple hash function for seed-based selection
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
