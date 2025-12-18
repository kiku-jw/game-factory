// Game Factory - export_challenge Tool Handler

import { z } from 'zod';
import { RunStore } from '../engine/RunStore.js';
import { formatShareText } from '../../shared/seedCodec.js';
import type { ExportChallengeOutput } from '../types/index.js';

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const ExportChallengeInputSchema = z.object({
  runRef: z.string().min(1),
});

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export const exportChallengeToolDefinition = {
  name: 'export_challenge',
  description: 'Get a shareable seed code and challenge text for the current or completed run.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      runRef: {
        type: 'string',
        description: 'Run reference from start_run',
      },
    },
    required: ['runRef'],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
  },
};

// =============================================================================
// HANDLER
// =============================================================================

export function handleExportChallenge(input: unknown): {
  structuredContent: ExportChallengeOutput;
} {
  const parsed = ExportChallengeInputSchema.parse(input);
  const { runRef } = parsed;

  // Get the run
  const state = RunStore.get(runRef);
  if (!state) {
    throw new Error('Run not found');
  }

  // Get world name
  const worldName = getWorldName(state.settings.genre, state.settings.templateId);

  // Build share text
  const shareText = formatShareText(state.seed, worldName, state.turn);

  const structuredContent: ExportChallengeOutput = {
    seed: state.seed,
    shareText,
  };

  return { structuredContent };
}

// =============================================================================
// HELPERS
// =============================================================================

function getWorldName(genre: string, templateId?: string): string {
  if (templateId) {
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
