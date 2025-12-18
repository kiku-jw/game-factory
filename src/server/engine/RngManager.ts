// Game Factory - Deterministic RNG Manager
// Server-only, no client input to outcomes

import seedrandom from 'seedrandom';
import { DIFFICULTY_MODIFIERS } from '../../shared/constants.js';
import type { Difficulty } from '../types/index.js';

/**
 * Deterministic random number generator
 * Same seed + turn + actionId = same outcome every time
 */
export class RngManager {
  /**
   * Generate a deterministic roll (0-99) based on game state
   * @param gameSeed - The game's seed
   * @param turn - Current turn number
   * @param actionId - The action being taken
   * @returns Number between 0-99
   */
  static deterministicRoll(gameSeed: string, turn: number, actionId: string): number {
    const rollSeed = `${gameSeed}:${turn}:${actionId}`;
    const rng = seedrandom(rollSeed);
    return Math.floor(rng() * 100);
  }

  /**
   * Check if an action succeeds based on risk percentage
   * @param gameSeed - The game's seed
   * @param turn - Current turn number
   * @param actionId - The action being taken
   * @param riskPercentage - Chance of success (0-100)
   * @param difficulty - Game difficulty for modifiers
   * @returns Object with success boolean and details
   */
  static resolveRisk(
    gameSeed: string,
    turn: number,
    actionId: string,
    riskPercentage: number,
    difficulty: Difficulty = 'normal'
  ): RiskResult {
    // Apply difficulty modifier
    const modifier = DIFFICULTY_MODIFIERS[difficulty].riskReduction;
    const adjustedRisk = Math.min(100, Math.max(0, riskPercentage + modifier));

    // Roll
    const roll = this.deterministicRoll(gameSeed, turn, actionId);
    const success = roll < adjustedRisk;

    return {
      success,
      roll,
      threshold: adjustedRisk,
      originalRisk: riskPercentage,
      modifier,
    };
  }

  /**
   * Select a random item from an array deterministically
   * @param gameSeed - The game's seed
   * @param turn - Current turn number
   * @param context - Additional context for uniqueness
   * @param items - Array to select from
   */
  static selectFrom<T>(
    gameSeed: string,
    turn: number,
    context: string,
    items: T[]
  ): T {
    if (items.length === 0) {
      throw new Error('Cannot select from empty array');
    }

    const rollSeed = `${gameSeed}:${turn}:select:${context}`;
    const rng = seedrandom(rollSeed);
    const index = Math.floor(rng() * items.length);
    return items[index];
  }

  /**
   * Shuffle an array deterministically
   */
  static shuffle<T>(
    gameSeed: string,
    turn: number,
    context: string,
    items: T[]
  ): T[] {
    const result = [...items];
    const rollSeed = `${gameSeed}:${turn}:shuffle:${context}`;
    const rng = seedrandom(rollSeed);

    // Fisher-Yates shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  /**
   * Generate a random number in range deterministically
   */
  static randomInRange(
    gameSeed: string,
    turn: number,
    context: string,
    min: number,
    max: number
  ): number {
    const rollSeed = `${gameSeed}:${turn}:range:${context}`;
    const rng = seedrandom(rollSeed);
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  /**
   * Check if an event should occur based on probability
   */
  static shouldOccur(
    gameSeed: string,
    turn: number,
    context: string,
    probability: number  // 0-100
  ): boolean {
    const roll = this.deterministicRoll(gameSeed, turn, context);
    return roll < probability;
  }
}

export interface RiskResult {
  success: boolean;
  roll: number;           // The actual roll (0-99)
  threshold: number;      // Adjusted threshold (with difficulty)
  originalRisk: number;   // Original risk percentage
  modifier: number;       // Difficulty modifier applied
}
