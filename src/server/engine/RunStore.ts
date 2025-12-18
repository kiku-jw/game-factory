// Game Factory - Run Store (In-Memory State Management)

import { GameState } from '../types/index.js';
import { STATE_CONFIG } from '../../shared/constants.js';

/**
 * In-memory store for game runs
 * - Keyed by runRef
 * - Auto-cleanup of stale runs
 * - Thread-safe operations
 */
class RunStoreImpl {
  private runs: Map<string, GameState> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Get a run by reference
   */
  get(runRef: string): GameState | null {
    return this.runs.get(runRef) ?? null;
  }

  /**
   * Check if a run exists
   */
  has(runRef: string): boolean {
    return this.runs.has(runRef);
  }

  /**
   * Create a new run
   */
  create(state: GameState): void {
    this.runs.set(state.runRef, state);
  }

  /**
   * Update a run (partial update)
   */
  update(runRef: string, update: Partial<GameState>): GameState | null {
    const existing = this.runs.get(runRef);
    if (!existing) return null;

    const updated: GameState = {
      ...existing,
      ...update,
      lastTurnAt: Date.now(),
    };

    this.runs.set(runRef, updated);
    return updated;
  }

  /**
   * Delete a run
   */
  delete(runRef: string): boolean {
    return this.runs.delete(runRef);
  }

  /**
   * Get count of active runs
   */
  get size(): number {
    return this.runs.size;
  }

  /**
   * Start periodic cleanup of stale runs
   */
  private startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleRuns();
    }, STATE_CONFIG.cleanupInterval);

    // Don't block process exit
    this.cleanupTimer.unref();
  }

  /**
   * Remove runs older than TTL
   */
  private cleanupStaleRuns(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [runRef, state] of this.runs) {
      if (now - state.lastTurnAt > STATE_CONFIG.runTTL) {
        this.runs.delete(runRef);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RunStore] Cleaned up ${cleaned} stale runs. Active: ${this.runs.size}`);
    }
  }

  /**
   * Force cleanup (for testing)
   */
  forceCleanup(): void {
    this.cleanupStaleRuns();
  }

  /**
   * Clear all runs (for testing)
   */
  clear(): void {
    this.runs.clear();
  }

  /**
   * Stop cleanup timer (for shutdown)
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Singleton instance
export const RunStore = new RunStoreImpl();

// Export class for testing
export { RunStoreImpl };
