// Game Factory - end_run Tool Handler

import { z } from 'zod';
import { RunStore } from '../engine/RunStore.js';
import { GameEngine } from '../engine/GameEngine.js';
import { formatShareText } from '../../shared/seedCodec.js';
import type { EndRunOutput, EndRunMeta } from '../types/index.js';

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const EndRunInputSchema = z.object({
  runRef: z.string().min(1),
  reason: z.enum(['victory', 'defeat', 'escape', 'abandon']),
});

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export const endRunToolDefinition = {
  name: 'end_run',
  description: 'End a game run and get the final summary with stats and shareable seed.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      runRef: {
        type: 'string',
        description: 'Run reference from start_run',
      },
      reason: {
        type: 'string',
        enum: ['victory', 'defeat', 'escape', 'abandon'],
        description: 'Reason for ending the run',
      },
    },
    required: ['runRef', 'reason'],
  },
  annotations: {
    readOnlyHint: false,
    openWorldHint: false,
    destructiveHint: false,  // Not destructive - game ending is normal gameplay
  },
};

// =============================================================================
// HANDLER
// =============================================================================

export function handleEndRun(input: unknown): {
  structuredContent: EndRunOutput;
  _meta: EndRunMeta;
} {
  const parsed = EndRunInputSchema.parse(input);
  const { runRef, reason } = parsed;

  // Get the run
  const state = RunStore.get(runRef);
  if (!state) {
    throw new Error('Run not found');
  }

  // End the run via engine (gets narrative and rating)
  const result = GameEngine.endRun(state, reason);

  if (result.type !== 'run_ended') {
    throw new Error('Unexpected result type');
  }

  // Calculate final stats
  const rating = result.rating;

  // Build structuredContent (includes seed for sharing)
  const structuredContent: EndRunOutput = {
    turnsSurvived: state.turn,
    itemsFound: state.itemsFound.length,
    threatsDefeated: state.threatsDefeated,
    progressReached: state.progress,
    rating,
    seed: state.seed,
  };

  // Build share text
  const worldName = getWorldName(state.settings.genre, state.settings.templateId);
  const shareText = formatShareText(state.seed, worldName, state.turn);

  // Build _meta
  const _meta: EndRunMeta = {
    'openai/outputTemplate': 'EndRunCard',
    runRef: state.runRef,
    endingNarrative: result.narrative,
    itemsList: state.itemsFound,
    shareText,
  };

  return { structuredContent, _meta };
}

// =============================================================================
// HELPERS
// =============================================================================

function getWorldName(genre: string, templateId?: string): string {
  if (templateId) {
    // Try to get from template
    return templateId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const names: Record<string, string> = {
    'fantasy': 'The Ancient Realm',
    'sci-fi': 'Abandoned Station',
    'mystery': 'Thornwood Manor',
    'horror-lite': 'The Forsaken Cabin',
  };
  return names[genre] || 'Unknown World';
}
