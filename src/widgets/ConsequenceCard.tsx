// Game Factory - ConsequenceCard Widget
// Shown when a choice fails and player must choose consequence

import React, { useState } from 'react';
import type { ConsequenceDisplay } from './types.js';

interface ConsequenceCardProps {
  // From structuredContent
  turn: number;
  consequences: ConsequenceDisplay[];
  failureSummary: string;

  // From _meta
  runRef: string;
  failureNarrative: string;

  // Callbacks
  onConsequenceResolved: (result: unknown) => void;
  onRunEnded: (result: unknown) => void;
}

export function ConsequenceCard({
  turn,
  consequences,
  failureSummary,
  runRef,
  failureNarrative,
  onConsequenceResolved,
  onRunEnded,
}: ConsequenceCardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConsequence = async (consequenceId: string) => {
    setLoading(true);
    setSelectedId(consequenceId);

    try {
      const result = await window.openai.callTool('act', {
        runRef,
        actionId: consequenceId,
        clientTurn: turn,
      });

      const outcome = (result.structuredContent as any)?.outcome;
      if (outcome === 'run_ended') {
        onRunEnded(result);
      } else {
        await window.openai.setWidgetState({
          lastKnownTurn: (result.structuredContent as any)?.turn || turn + 1,
        });
        onConsequenceResolved(result);
      }
    } finally {
      setLoading(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden max-w-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="flex items-center gap-2 text-yellow-600">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">Action Failed</span>
        </div>
      </div>

      {/* Failure Narrative */}
      <div className="px-4 py-4">
        <p className="text-base leading-relaxed">
          {failureNarrative}
        </p>
      </div>

      {/* Prompt */}
      <div className="px-4 pb-2">
        <p className="text-sm text-secondary font-medium">
          Choose how to proceed:
        </p>
      </div>

      {/* Consequence Options */}
      <div className="px-4 pb-4 space-y-2">
        {consequences.map((consequence) => (
          <button
            key={consequence.id}
            onClick={() => handleConsequence(consequence.id)}
            disabled={loading}
            className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${
              loading && selectedId === consequence.id
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-surface-secondary hover:bg-surface-tertiary border-default'
            } disabled:opacity-50`}
          >
            {consequence.label}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="px-4 pb-3">
        <p className="text-xs text-secondary">
          💡 Each option has a cost, but you will continue your journey.
        </p>
      </div>
    </div>
  );
}

export default ConsequenceCard;
