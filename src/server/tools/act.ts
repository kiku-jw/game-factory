// Game Factory - act Tool Handler (Retry-Safe)

import { z } from 'zod';
import { GameEngine, ActionResult } from '../engine/GameEngine.js';
import type {
  ActInput,
  ActOutput,
  ActSuccessOutput,
  ActPendingOutput,
  ActRunEndedOutput,
  ActOutOfSyncOutput,
  ChoiceOutput,
  ActSuccessMeta,
  ActPendingMeta,
  ActRunEndedMeta,
} from '../types/index.js';

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const ActInputSchema = z.object({
  runRef: z.string().min(1),
  actionId: z.string().min(1),
  clientTurn: z.number().int().positive(),
});

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export const actToolDefinition = {
  name: 'act',
  description: 'Apply a player choice or consequence. Server determines success/failure.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      runRef: {
        type: 'string',
        description: 'Run reference from start_run',
      },
      actionId: {
        type: 'string',
        description: 'ID of the choice or consequence to apply',
      },
      clientTurn: {
        type: 'number',
        description: 'Last known turn number for retry-safety',
      },
    },
    required: ['runRef', 'actionId', 'clientTurn'],
  },
  annotations: {
    readOnlyHint: false,
    openWorldHint: false,
    destructiveHint: false,
  },
};

// =============================================================================
// HANDLER
// =============================================================================

type ActMeta = ActSuccessMeta | ActPendingMeta | ActRunEndedMeta;

export function handleAct(input: unknown): {
  structuredContent: ActOutput;
  _meta: ActMeta;
} {
  // Validate input
  const parsed = ActInputSchema.parse(input);
  const { runRef, actionId, clientTurn } = parsed;

  // Process the action
  const result = GameEngine.processAction(runRef, actionId, clientTurn);

  // Handle each result type
  switch (result.type) {
    case 'success':
      return handleSuccess(result);

    case 'pending_consequence':
      return handlePendingConsequence(result);

    case 'run_ended':
      return handleRunEnded(result);

    case 'out_of_sync':
      return handleOutOfSync(result);

    case 'error':
      throw new Error(result.message);

    default:
      throw new Error('Unknown result type');
  }
}

// =============================================================================
// RESULT HANDLERS
// =============================================================================

function handleSuccess(result: Extract<ActionResult, { type: 'success' }>): {
  structuredContent: ActSuccessOutput;
  _meta: ActSuccessMeta;
} {
  const { state, narrative } = result;

  // Format choices
  const choices: ChoiceOutput[] = state.currentScene.choices.map(c => ({
    id: c.id,
    label: c.label,
    risk: c.risk,
    cost: c.cost ? formatCost(c.cost) : null,
  }));

  const structuredContent: ActSuccessOutput = {
    outcome: 'success',
    turn: state.turn,
    hp: state.hp,
    supplies: state.supplies,
    threat: state.threatLevel,
    invCount: state.inventory.length,
    changes: formatChanges(state),
    choices,
    sceneSummary: state.currentScene.title,
  };

  const _meta: ActSuccessMeta = {
    'openai/outputTemplate': 'SceneCard',
    runRef: state.runRef,
    narrative,
    chapterTitle: state.currentScene.title,
  };

  return { structuredContent, _meta };
}

function handlePendingConsequence(result: Extract<ActionResult, { type: 'pending_consequence' }>): {
  structuredContent: ActPendingOutput;
  _meta: ActPendingMeta;
} {
  const { state, consequences, failureNarrative } = result;

  const structuredContent: ActPendingOutput = {
    outcome: 'pending_consequence',
    turn: state.turn,
    consequences: consequences.map(c => ({
      id: c.id,
      label: c.label,
    })),
    failureSummary: 'Action failed, choose consequence',
  };

  const _meta: ActPendingMeta = {
    'openai/outputTemplate': 'ConsequenceCard',
    runRef: state.runRef,
    failureNarrative,
  };

  return { structuredContent, _meta };
}

function handleRunEnded(result: Extract<ActionResult, { type: 'run_ended' }>): {
  structuredContent: ActRunEndedOutput;
  _meta: ActRunEndedMeta;
} {
  const { state, reason, narrative } = result;

  const structuredContent: ActRunEndedOutput = {
    outcome: 'run_ended',
    reason: reason as ActRunEndedOutput['reason'],
    endingSummary: reason === 'defeat' ? 'Run ended' : `Run completed: ${reason}`,
  };

  const _meta: ActRunEndedMeta = {
    'openai/outputTemplate': 'EndRunCard',
    runRef: state.runRef,
    endingNarrative: narrative,
  };

  return { structuredContent, _meta };
}

function handleOutOfSync(result: Extract<ActionResult, { type: 'out_of_sync' }>): {
  structuredContent: ActOutOfSyncOutput;
  _meta: ActSuccessMeta;
} {
  const { state, currentTurn } = result;

  const structuredContent: ActOutOfSyncOutput = {
    outcome: 'out_of_sync',
    currentTurn,
    hp: state.hp,
    supplies: state.supplies,
    message: 'Action already applied, refreshing state',
  };

  const _meta: ActSuccessMeta = {
    'openai/outputTemplate': 'SceneCard',
    runRef: state.runRef,
    narrative: state.currentScene.narrative,
    chapterTitle: state.currentScene.title,
  };

  return { structuredContent, _meta };
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCost(cost: { type: string; amount: number }): string {
  if (cost.amount === 0) return '';

  switch (cost.type) {
    case 'hp':
      return `${cost.amount} HP`;
    case 'supplies':
      return `${cost.amount} supply`;
    case 'turn':
      return `${cost.amount} turn`;
    case 'threat':
      return 'raises threat';
    case 'item':
      return 'uses item';
    default:
      return cost.type;
  }
}

function formatChanges(state: { eventsLog: string[] }): string {
  const lastEvent = state.eventsLog[state.eventsLog.length - 1];
  return lastEvent || 'Progressed';
}
