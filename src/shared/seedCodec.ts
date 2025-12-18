// Game Factory Seed Codec
// Encodes/decodes shareable seed codes

import { Genre, Tone, Length, GameSettings } from '../server/types/index.js';
import { SEED_PREFIX, GENRE_CODES, TONE_CODES, LENGTH_CODES } from './constants.js';

// =============================================================================
// SEED FORMAT: GF-{GENRE}-{TONE}-{LENGTH}-{RANDOM}
// Example: GF-SCI-L-M-7K9X
// =============================================================================

/**
 * Generate a random 4-character alphanumeric code
 */
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Encode game settings into a shareable seed
 */
export function encodeSeed(settings: GameSettings): string {
  const genreCode = GENRE_CODES[settings.genre] || 'UNK';
  const toneCode = TONE_CODES[settings.tone] || 'L';
  const lengthCode = LENGTH_CODES[settings.length] || 'M';
  const randomCode = generateRandomCode();

  return `${SEED_PREFIX}-${genreCode}-${toneCode}-${lengthCode}-${randomCode}`;
}

/**
 * Decode a seed into partial settings
 * Returns null if seed is invalid
 */
export function decodeSeed(seed: string): Partial<GameSettings> | null {
  const parts = seed.split('-');

  if (parts.length !== 5 || parts[0] !== SEED_PREFIX) {
    return null;
  }

  const [, genreCode, toneCode, lengthCode] = parts;

  // Reverse lookup
  const genre = Object.entries(GENRE_CODES).find(([, v]) => v === genreCode)?.[0] as Genre | undefined;
  const tone = Object.entries(TONE_CODES).find(([, v]) => v === toneCode)?.[0] as Tone | undefined;
  const length = Object.entries(LENGTH_CODES).find(([, v]) => v === lengthCode)?.[0] as Length | undefined;

  if (!genre) return null;

  return {
    genre,
    tone: tone || 'light',
    length: length || 'medium',
  };
}

/**
 * Validate seed format
 */
export function isValidSeed(seed: string): boolean {
  const regex = /^GF-[A-Z]{3}-[SL]-[SML]-[A-Z0-9]{4}$/;
  return regex.test(seed);
}

/**
 * Generate a unique run reference
 */
export function generateRunRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `run-${timestamp}-${random}`;
}

/**
 * Format share text for a completed run
 */
export function formatShareText(
  seed: string,
  templateName: string,
  turnsSurvived: number
): string {
  return [
    'Game Factory Challenge!',
    `I survived ${turnsSurvived} turns in "${templateName}"`,
    'Can you beat me?',
    `Seed: ${seed}`,
    'Rules: 13+ safe',
  ].join('\n');
}
