// Game Factory - Phase 0 Spike Tests
// Quality Gates verification

import { describe, it, expect, beforeEach } from 'vitest';
import { RunStore } from '../src/server/engine/RunStore.js';
import { RngManager } from '../src/server/engine/RngManager.js';
import { GameEngine } from '../src/server/engine/GameEngine.js';
import { handleStartRun } from '../src/server/tools/startRun.js';
import { handleAct } from '../src/server/tools/act.js';

describe('Phase 0 Spike - Quality Gates', () => {
  beforeEach(() => {
    RunStore.clear();
  });

  // ===========================================================================
  // GATE 1: Context not bloated
  // ===========================================================================
  describe('Gate 1: structuredContent is concise', () => {
    it('start_run output should be under 500 chars', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      const json = JSON.stringify(result.structuredContent);

      expect(json.length).toBeLessThan(500);
      console.log(`start_run structuredContent size: ${json.length} chars`);
    });

    it('start_run should not include narrative in structuredContent', () => {
      const result = handleStartRun({ genre: 'fantasy' });

      expect(result.structuredContent).not.toHaveProperty('narrative');
      expect(result.structuredContent).not.toHaveProperty('runRef');
      expect(result._meta).toHaveProperty('narrative');
      expect(result._meta).toHaveProperty('runRef');
    });

    it('act success output should be concise', () => {
      // Start a run
      const startResult = handleStartRun({ genre: 'fantasy' });
      const runRef = startResult._meta.runRef;

      // Make a choice
      const actResult = handleAct({
        runRef,
        actionId: 'c1',
        clientTurn: 1,
      });

      const json = JSON.stringify(actResult.structuredContent);
      expect(json.length).toBeLessThan(500);
      console.log(`act structuredContent size: ${json.length} chars`);
    });
  });

  // ===========================================================================
  // GATE 2: Retry-safe act
  // ===========================================================================
  describe('Gate 2: act is retry-safe', () => {
    it('duplicate act call should return out_of_sync', () => {
      // Start a run
      const startResult = handleStartRun({ genre: 'fantasy' });
      const runRef = startResult._meta.runRef;

      // First call succeeds
      const firstAct = handleAct({
        runRef,
        actionId: 'c1',
        clientTurn: 1,
      });

      expect(firstAct.structuredContent.outcome).toBe('success');
      expect((firstAct.structuredContent as any).turn).toBe(2);

      // Second call with same clientTurn should detect out_of_sync
      const secondAct = handleAct({
        runRef,
        actionId: 'c1',
        clientTurn: 1, // Still says turn 1
      });

      expect(secondAct.structuredContent.outcome).toBe('out_of_sync');
      expect((secondAct.structuredContent as any).currentTurn).toBe(2);
    });

    it('state should not change on retry', () => {
      // Start a run
      const startResult = handleStartRun({ genre: 'fantasy' });
      const runRef = startResult._meta.runRef;

      // First call
      handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      const stateAfterFirst = RunStore.get(runRef);

      // Retry call (same clientTurn)
      handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      const stateAfterRetry = RunStore.get(runRef);

      // Turn should not have incremented twice
      expect(stateAfterFirst?.turn).toBe(stateAfterRetry?.turn);
    });
  });

  // ===========================================================================
  // GATE 3: Honest persistence model
  // ===========================================================================
  describe('Gate 3: Persistence model is honest', () => {
    it('runRef should be in _meta only', () => {
      const result = handleStartRun({ genre: 'fantasy' });

      expect(result.structuredContent).not.toHaveProperty('runRef');
      expect(result._meta.runRef).toBeDefined();
      expect(result._meta.runRef).toMatch(/^run-/);
    });

    it('state should be server-side only', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      const runRef = result._meta.runRef;

      // State should exist on server
      const state = RunStore.get(runRef);
      expect(state).not.toBeNull();
      expect(state?.hp).toBe(10);

      // But not in structuredContent
      expect(result.structuredContent).not.toHaveProperty('inventory');
      expect(result.structuredContent).not.toHaveProperty('flags');
    });
  });

  // ===========================================================================
  // DETERMINISTIC RNG
  // ===========================================================================
  describe('Deterministic RNG', () => {
    it('same seed+turn+action should give same roll', () => {
      const seed = 'test-seed';
      const turn = 5;
      const actionId = 'action-1';

      const roll1 = RngManager.deterministicRoll(seed, turn, actionId);
      const roll2 = RngManager.deterministicRoll(seed, turn, actionId);
      const roll3 = RngManager.deterministicRoll(seed, turn, actionId);

      expect(roll1).toBe(roll2);
      expect(roll2).toBe(roll3);
    });

    it('different inputs should give different rolls', () => {
      const seed = 'test-seed';

      const roll1 = RngManager.deterministicRoll(seed, 1, 'action-1');
      const roll2 = RngManager.deterministicRoll(seed, 2, 'action-1');
      const roll3 = RngManager.deterministicRoll(seed, 1, 'action-2');

      expect(roll1).not.toBe(roll2);
      expect(roll1).not.toBe(roll3);
    });
  });

  // ===========================================================================
  // BASIC GAME FLOW
  // ===========================================================================
  describe('Basic game flow', () => {
    it('should complete a full turn cycle', () => {
      // Start
      const startResult = handleStartRun({ genre: 'sci-fi', difficulty: 'easy' });
      expect(startResult.structuredContent.turn).toBe(1);
      expect(startResult.structuredContent.hp).toBe(12); // Easy mode bonus

      const runRef = startResult._meta.runRef;

      // Act
      const actResult = handleAct({
        runRef,
        actionId: 'c1',
        clientTurn: 1,
      });

      expect(actResult.structuredContent.outcome).toBe('success');
      expect((actResult.structuredContent as any).turn).toBe(2);
    });

    it('surprise mode should work', () => {
      const result = handleStartRun({ surprise: true });

      expect(result.structuredContent.turn).toBe(1);
      expect(result._meta.runRef).toBeDefined();
      expect(result._meta.seed).toMatch(/^GF-/);
    });
  });
});
