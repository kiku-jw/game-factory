// Game Factory - SceneCard Widget
// Main game screen with narrative and choices

import React, { useState } from 'react';
import type { ChoiceDisplay } from './types.js';

interface SceneCardProps {
  // From structuredContent
  turn: number;
  hp: number;
  supplies: number;
  threat: 'low' | 'medium' | 'high';
  invCount: number;
  choices: ChoiceDisplay[];

  // From _meta
  runRef: string;
  narrative: string;
  chapterTitle: string;

  // Callbacks
  onChoice: (result: unknown) => void;
  onRunEnded: (result: unknown) => void;
}

export function SceneCard({
  turn,
  hp,
  supplies,
  threat,
  invCount,
  choices,
  runRef,
  narrative,
  chapterTitle,
  onChoice,
  onRunEnded,
}: SceneCardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handleChoice = async (choiceId: string) => {
    setLoading(true);
    setSelectedChoiceId(choiceId);

    try {
      const result = await window.openai.callTool('act', {
        runRef,
        actionId: choiceId,
        clientTurn: turn,
      });

      // Update widget state
      const outcome = (result.structuredContent as any)?.outcome;
      if (outcome === 'success' || outcome === 'out_of_sync') {
        await window.openai.setWidgetState({
          lastKnownTurn: (result.structuredContent as any)?.turn || turn + 1,
        });
        onChoice(result);
      } else if (outcome === 'pending_consequence') {
        onChoice(result);
      } else if (outcome === 'run_ended') {
        onRunEnded(result);
      }
    } finally {
      setLoading(false);
      setSelectedChoiceId(null);
    }
  };

  const getThreatColor = () => {
    switch (threat) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
    }
  };

  const getHpColor = () => {
    const ratio = hp / 10;
    if (ratio > 0.6) return 'text-green-500';
    if (ratio > 0.3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden max-w-lg">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-default text-sm">
        <div className="flex items-center gap-4">
          <span className={getHpColor()}>❤️ {hp}/10</span>
          <span className="text-blue-500">📦 {supplies}</span>
          <span className="text-purple-500">🎒 {invCount}/8</span>
        </div>
        <span className={getThreatColor()}>
          ⚠️ {threat.charAt(0).toUpperCase() + threat.slice(1)}
        </span>
      </div>

      {/* Chapter/Turn */}
      <div className="px-4 py-2 border-b border-default">
        <span className="text-sm text-secondary">
          {chapterTitle} • Turn {turn}
        </span>
      </div>

      {/* Narrative */}
      <div className="px-4 py-4">
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {narrative}
        </p>
      </div>

      {/* Choices */}
      <div className="px-4 pb-4 space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice.id)}
            disabled={loading}
            className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${loading && selectedChoiceId === choice.id
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-secondary hover:bg-surface-tertiary border-default'
              } disabled:opacity-50`}
          >
            <div className="flex items-center justify-between">
              <span>{choice.label}</span>
              {(choice.risk || choice.cost) && (
                <span className="text-sm text-secondary">
                  {choice.risk && `${choice.risk}% safe`}
                  {choice.risk && choice.cost && ' • '}
                  {choice.cost && `costs ${choice.cost}`}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SceneCard;
