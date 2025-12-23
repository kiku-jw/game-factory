import { RATE_LIMITS } from '../../shared/constants.js';

interface ClientUsage {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static usage = new Map<string, ClientUsage>();

  /**
   * Check if a request is allowed.
   * Since we are on Stdio, we might not have unique client IDs.
   * We can use a default key or allow passing a key.
   */
  static check(key: string, type: 'startRun' | 'act'): boolean {
    const config = RATE_LIMITS[type];
    const now = Date.now();
    const compositeKey = `${key}:${type}`;

    let usage = this.usage.get(compositeKey);

    // Initialize or reset if window passed
    if (!usage || now > usage.resetTime) {
      usage = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      this.usage.set(compositeKey, usage);
    }

    // Check limit
    if (usage.count >= config.max) {
      return false;
    }

    // Increment
    usage.count++;
    return true;
  }

  static getResetTime(key: string, type: 'startRun' | 'act'): number {
    const compositeKey = `${key}:${type}`;
    return this.usage.get(compositeKey)?.resetTime || 0;
  }

  static reset(): void {
    this.usage.clear();
  }
}
