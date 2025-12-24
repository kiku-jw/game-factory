import type { GameState } from '../types/index.js';
import { STATE_CONFIG } from '../../shared/constants.js';

/**
 * In-memory store for game runs
 */
class RunStoreImpl {
  private runs: Map<string, GameState> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  get(runRef: string): GameState | null {
    return this.runs.get(runRef) ?? null;
  }

  has(runRef: string): boolean {
    return this.runs.has(runRef);
  }

  create(state: GameState): void {
    this.runs.set(state.runRef, state);
  }

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

  delete(runRef: string): boolean {
    return this.runs.delete(runRef);
  }

  get size(): number {
    return this.runs.size;
  }

  private startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleRuns();
    }, STATE_CONFIG.cleanupInterval);

    // Node.js specific: don't block process exit
    if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
      (this.cleanupTimer as { unref: () => void }).unref();
    }
  }

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

  forceCleanup(): void { this.cleanupStaleRuns(); }
  clear(): void { this.runs.clear(); }
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

export const RunStore = new RunStoreImpl();
export { RunStoreImpl };
