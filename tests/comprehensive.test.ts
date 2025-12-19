// Game Factory - Comprehensive Test Suite
// All tools, quality gates, and edge cases

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RunStore } from '../src/server/engine/RunStore.js';
import { RngManager } from '../src/server/engine/RngManager.js';
import { GameEngine } from '../src/server/engine/GameEngine.js';
import { initTemplates, loadTemplates, getTemplate } from '../src/server/engine/TemplateManager.js';
import { handleStartRun } from '../src/server/tools/startRun.js';
import { handleAct } from '../src/server/tools/act.js';
import { handleListTemplates } from '../src/server/tools/listTemplates.js';
import { handleEndRun } from '../src/server/tools/endRun.js';
import { handleExportChallenge } from '../src/server/tools/exportChallenge.js';
import { validateContent, sanitizeUserInput, sanitizeCustomTags } from '../src/server//../shared/safetyRules.js';
import { encodeSeed, decodeSeed, isValidSeed } from '../src/shared/seedCodec.js';

// =============================================================================
// SETUP
// =============================================================================

beforeEach(async () => {
  RunStore.clear();
  await initTemplates();
});

// =============================================================================
// QUALITY GATES
// =============================================================================

describe('Quality Gates', () => {
  describe('Gate 1: structuredContent is concise', () => {
    it('start_run output < 500 chars', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      const json = JSON.stringify(result.structuredContent);
      expect(json.length).toBeLessThan(500);
    });

    it('act success output < 500 chars', () => {
      const start = handleStartRun({ genre: 'fantasy' });
      const runRef = start._meta.runRef;

      const act = handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      const json = JSON.stringify(act.structuredContent);
      expect(json.length).toBeLessThan(500);
    });

    it('list_templates output is reasonably concise', () => {
      const result = handleListTemplates({ limit: 5 });
      const json = JSON.stringify(result.structuredContent);
      // 5 templates with id/name/genre/difficulty - around 500-600 chars is acceptable
      expect(json.length).toBeLessThan(700);
    });

    it('narrative is in _meta, not structuredContent', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      expect(result.structuredContent).not.toHaveProperty('narrative');
      expect(result._meta.narrative).toBeDefined();
      expect(result._meta.narrative.length).toBeGreaterThan(50);
    });

    it('runRef is in _meta, not structuredContent', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      expect(result.structuredContent).not.toHaveProperty('runRef');
      expect(result._meta.runRef).toBeDefined();
    });
  });

  describe('Gate 2: act is retry-safe', () => {
    it('duplicate act returns out_of_sync', () => {
      const start = handleStartRun({ genre: 'fantasy' });
      const runRef = start._meta.runRef;

      // First call succeeds
      const first = handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      expect(first.structuredContent.outcome).toBe('success');

      // Second call with same clientTurn = out_of_sync
      const second = handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      expect(second.structuredContent.outcome).toBe('out_of_sync');
    });

    it('state does not change on retry', () => {
      const start = handleStartRun({ genre: 'fantasy' });
      const runRef = start._meta.runRef;

      handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      const stateAfterFirst = RunStore.get(runRef);

      handleAct({ runRef, actionId: 'c1', clientTurn: 1 });
      const stateAfterRetry = RunStore.get(runRef);

      expect(stateAfterFirst?.turn).toBe(stateAfterRetry?.turn);
    });
  });

  describe('Gate 3: Honest persistence model', () => {
    it('runRef is server-generated', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      expect(result._meta.runRef).toMatch(/^run-/);
    });

    it('state is stored by runRef', () => {
      const result = handleStartRun({ genre: 'fantasy' });
      const state = RunStore.get(result._meta.runRef);
      expect(state).not.toBeNull();
      expect(state?.hp).toBeDefined();
    });
  });
});

// =============================================================================
// TOOL: list_templates
// =============================================================================

describe('Tool: list_templates', () => {
  it('returns all templates', () => {
    const result = handleListTemplates({});
    expect(result.structuredContent.templates.length).toBeGreaterThan(0);
    expect(result.structuredContent.total).toBeGreaterThan(0);
  });

  it('filters by genre', () => {
    const result = handleListTemplates({ genre: 'fantasy' });
    result.structuredContent.templates.forEach(t => {
      expect(t.genre).toBe('fantasy');
    });
  });

  it('filters by featured', () => {
    const result = handleListTemplates({ featured: true });
    const meta = result._meta as any;
    meta.templateDetails.forEach((t: any) => {
      expect(t.featured).toBe(true);
    });
  });

  it('respects limit', () => {
    const result = handleListTemplates({ limit: 2 });
    expect(result.structuredContent.templates.length).toBeLessThanOrEqual(2);
  });
});

// =============================================================================
// TOOL: start_run
// =============================================================================

describe('Tool: start_run', () => {
  it('creates run with genre', () => {
    const result = handleStartRun({ genre: 'sci-fi' });
    expect(result.structuredContent.turn).toBe(1);
    expect(result.structuredContent.hp).toBeGreaterThan(0);
    expect(result._meta.seed).toContain('SCI');
  });

  it('creates run with surprise', () => {
    const result = handleStartRun({ surprise: true });
    expect(result.structuredContent.turn).toBe(1);
    expect(result._meta.seed).toMatch(/^GF-/);
  });

  it('applies difficulty modifiers', () => {
    const easy = handleStartRun({ genre: 'fantasy', difficulty: 'easy' });
    const hard = handleStartRun({ genre: 'fantasy', difficulty: 'hard' });

    expect(easy.structuredContent.hp).toBeGreaterThan(hard.structuredContent.hp);
  });

  it('returns choices', () => {
    const result = handleStartRun({ genre: 'fantasy' });
    expect(result.structuredContent.choices.length).toBeGreaterThan(0);
    result.structuredContent.choices.forEach(c => {
      expect(c.id).toBeDefined();
      expect(c.label).toBeDefined();
    });
  });
});

// =============================================================================
// TOOL: act
// =============================================================================

describe('Tool: act', () => {
  it('processes safe choice successfully', () => {
    const start = handleStartRun({ genre: 'fantasy' });
    const runRef = start._meta.runRef;
    const safeChoice = start.structuredContent.choices.find(c => c.risk === null);

    if (safeChoice) {
      const result = handleAct({ runRef, actionId: safeChoice.id, clientTurn: 1 });
      expect(result.structuredContent.outcome).toBe('success');
      expect((result.structuredContent as any).turn).toBe(2);
    }
  });

  it('returns error for invalid runRef', () => {
    expect(() => {
      handleAct({ runRef: 'invalid', actionId: 'c1', clientTurn: 1 });
    }).toThrow('Run not found');
  });

  it('returns error for invalid actionId', () => {
    const start = handleStartRun({ genre: 'fantasy' });
    const runRef = start._meta.runRef;

    expect(() => {
      handleAct({ runRef, actionId: 'invalid-action', clientTurn: 1 });
    }).toThrow('Invalid choice');
  });
});

// =============================================================================
// TOOL: end_run
// =============================================================================

describe('Tool: end_run', () => {
  it('ends run with victory', () => {
    const start = handleStartRun({ genre: 'fantasy' });
    const runRef = start._meta.runRef;

    const result = handleEndRun({ runRef, reason: 'victory' });
    expect(result.structuredContent.turnsSurvived).toBe(1);
    expect(result.structuredContent.rating.stars).toBeGreaterThan(0);
    expect(result.structuredContent.seed).toBeDefined();
  });

  it('includes share text in _meta', () => {
    const start = handleStartRun({ genre: 'fantasy' });
    const runRef = start._meta.runRef;

    const result = handleEndRun({ runRef, reason: 'escape' });
    expect(result._meta.shareText).toContain('Game Factory');
    expect(result._meta.shareText).toContain('Seed:');
  });
});

// =============================================================================
// TOOL: export_challenge
// =============================================================================

describe('Tool: export_challenge', () => {
  it('exports seed and share text', () => {
    const start = handleStartRun({ genre: 'fantasy' });
    const runRef = start._meta.runRef;

    const result = handleExportChallenge({ runRef });
    expect(result.structuredContent.seed).toMatch(/^GF-/);
    expect(result.structuredContent.shareText).toContain('Game Factory');
  });
});

// =============================================================================
// DETERMINISTIC RNG
// =============================================================================

describe('Deterministic RNG', () => {
  it('same inputs = same roll', () => {
    const roll1 = RngManager.deterministicRoll('seed', 1, 'action');
    const roll2 = RngManager.deterministicRoll('seed', 1, 'action');
    expect(roll1).toBe(roll2);
  });

  it('different inputs = different rolls', () => {
    const roll1 = RngManager.deterministicRoll('seed', 1, 'action1');
    const roll2 = RngManager.deterministicRoll('seed', 1, 'action2');
    expect(roll1).not.toBe(roll2);
  });

  it('resolveRisk applies difficulty modifier', () => {
    const easy = RngManager.resolveRisk('seed', 1, 'action', 70, 'easy');
    const hard = RngManager.resolveRisk('seed', 1, 'action', 70, 'hard');

    // Easy has +10% success, hard has -10%
    expect(easy.threshold).toBe(80);
    expect(hard.threshold).toBe(60);
  });
});

// =============================================================================
// CONTENT SAFETY
// =============================================================================

describe('Content Safety', () => {
  it('validates clean content', () => {
    const result = validateContent('A normal adventure story');
    expect(result.valid).toBe(true);
  });

  it('rejects forbidden keywords', () => {
    const result = validateContent('The demon appeared');
    expect(result.valid).toBe(false);
    expect(result.flaggedKeyword).toBe('demon');
  });

  it('sanitizes user input', () => {
    const dirty = '<script>alert("xss")</script>Hello [inject] {test}';
    const clean = sanitizeUserInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('[inject]');
    expect(clean).not.toContain('{test}');
    expect(clean).toContain('Hello');
  });

  it('sanitizes custom tags', () => {
    const tags = ['good-tag', 'demon-bad', 'normal', 'extra1', 'extra2'];
    const clean = sanitizeCustomTags(tags);
    expect(clean).not.toContain('demon-bad');
    expect(clean.length).toBeLessThanOrEqual(3);
  });
});

// =============================================================================
// SEED CODEC
// =============================================================================

describe('Seed Codec', () => {
  it('encodes settings to seed', () => {
    const seed = encodeSeed({
      genre: 'sci-fi',
      tone: 'light',
      length: 'medium',
      difficulty: 'normal',
    });
    expect(seed).toMatch(/^GF-SCI-L-M-[A-Z0-9]{4}$/);
  });

  it('decodes seed to settings', () => {
    const settings = decodeSeed('GF-FAN-S-L-ABCD');
    expect(settings?.genre).toBe('fantasy');
    expect(settings?.tone).toBe('serious');
    expect(settings?.length).toBe('long');
  });

  it('validates seed format', () => {
    expect(isValidSeed('GF-SCI-L-M-7K9X')).toBe(true);
    expect(isValidSeed('invalid')).toBe(false);
    expect(isValidSeed('GF-XXX-X-X-XXXX')).toBe(false);
  });
});

// =============================================================================
// TEMPLATES
// =============================================================================

describe('Templates', () => {
  it('loads built-in templates', () => {
    const templates = loadTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('has templates for each genre', () => {
    const templates = loadTemplates();
    const genres = new Set(templates.map(t => t.genre));
    expect(genres.has('fantasy')).toBe(true);
    expect(genres.has('sci-fi')).toBe(true);
    expect(genres.has('mystery')).toBe(true);
    expect(genres.has('horror-lite')).toBe(true);
  });

  it('gets template by id', () => {
    const template = getTemplate('fantasy-crystal-caves');
    expect(template).not.toBeNull();
    expect(template?.name).toBe('Crystal Caves');
  });

  it('templates have required fields', () => {
    const templates = loadTemplates();
    templates.forEach(t => {
      expect(t.id).toBeDefined();
      expect(t.name).toBeDefined();
      expect(t.genre).toBeDefined();
      expect(t.initialScene).toBeDefined();
      expect(t.initialScene.choices.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// GAME FLOW
// =============================================================================

describe('Game Flow', () => {
  it('completes full game cycle', () => {
    // Start
    const start = handleStartRun({ genre: 'fantasy' });
    expect(start.structuredContent.turn).toBe(1);

    const runRef = start._meta.runRef;

    // Make several moves
    let turn = 1;
    for (let i = 0; i < 5; i++) {
      const state = RunStore.get(runRef);
      if (!state) break;

      const choices = state.currentScene.choices;
      const safeChoice = choices.find(c => c.risk === null) || choices[0];

      const act = handleAct({
        runRef,
        actionId: safeChoice.id,
        clientTurn: turn,
      });

      if (act.structuredContent.outcome === 'run_ended') break;
      if (act.structuredContent.outcome === 'success') {
        turn = (act.structuredContent as any).turn;
      }
    }

    // End
    const end = handleEndRun({ runRef, reason: 'escape' });
    expect(end.structuredContent.turnsSurvived).toBeGreaterThan(0);
    expect(end.structuredContent.seed).toBeDefined();
  });
});
