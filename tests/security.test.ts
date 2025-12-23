import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleStartRun } from '../src/server/tools/startRun';
import { handleAct } from '../src/server/tools/act';
import { RateLimiter } from '../src/server/security/RateLimiter';
import { RATE_LIMITS } from '../src/shared/constants';
import { GameEngine } from '../src/server/engine/GameEngine';

// Mock dependencies
vi.mock('../src/server/engine/GameEngine');

describe('Security Controls', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    // @ts-ignore - Accessing private static for testing
    RateLimiter.usage.clear();
    vi.clearAllMocks();

    // Mock GameEngine.createRun to return a dummy state
    (GameEngine.createRun as any).mockReturnValue({
      turn: 1,
      hp: 10,
      supplies: 5,
      threatLevel: 'low',
      inventory: [],
      currentScene: {
        title: 'Test Scene',
        narrative: 'Test Narrative',
        choices: [],
      },
      settings: {
        format: 'quest',
        genre: 'fantasy',
      },
      runRef: 'test-run',
      seed: 'test-seed',
    });

    (GameEngine.processAction as any).mockReturnValue({
      type: 'success',
      state: {
         turn: 2,
         hp: 10,
         supplies: 5,
         threatLevel: 'low',
         inventory: [],
         currentScene: {
            title: 'Next Scene',
            narrative: 'Next Narrative',
            choices: [],
         },
         eventsLog: [],
         runRef: 'test-run',
      },
      narrative: 'Success',
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits for start_run', () => {
      const limit = RATE_LIMITS.startRun.max;

      // Consume all tokens
      for (let i = 0; i < limit; i++) {
        expect(() => handleStartRun({})).not.toThrow();
      }

      // Next call should fail
      expect(() => handleStartRun({})).toThrow(/Rate limit exceeded/);
    });

    it('should enforce rate limits for act', () => {
      const limit = RATE_LIMITS.act.max;
      const input = { runRef: 'test', actionId: 'c1', clientTurn: 1 };

      // Consume all tokens
      for (let i = 0; i < limit; i++) {
        expect(() => handleAct(input)).not.toThrow();
      }

      // Next call should fail
      expect(() => handleAct(input)).toThrow(/Rate limit exceeded/);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize prompt in start_run', () => {
      const maliciousPrompt = 'Test <script>alert(1)</script> [injection]';

      handleStartRun({ prompt: maliciousPrompt });

      expect(GameEngine.createRun).toHaveBeenCalledWith(expect.objectContaining({
        prompt: 'Test alert(1)',
      }));
    });
  });
});
