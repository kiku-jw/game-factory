// Game Factory - EndRunCard Widget
// Shown when a run ends (victory, defeat, escape, abandon)

import React, { useState } from 'react';
import type { RatingDisplay } from './types.js';

interface EndRunCardProps {
  // From structuredContent
  turnsSurvived: number;
  itemsFound: number;
  threatsDefeated: number;
  progressReached: number;
  rating: RatingDisplay;
  seed: string;

  // From _meta
  runRef: string;
  endingNarrative: string;
  itemsList: string[];
  shareText: string;

  // Callbacks
  onNewRun: () => void;
  onBrowseTemplates: () => void;
}

export function EndRunCard({
  turnsSurvived,
  itemsFound,
  threatsDefeated,
  progressReached,
  rating,
  seed,
  runRef,
  endingNarrative,
  itemsList,
  shareText,
  onNewRun,
  onBrowseTemplates,
}: EndRunCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyChallenge = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderStars = () => {
    return '⭐'.repeat(rating.stars) + '☆'.repeat(5 - rating.stars);
  };

  const getProgressColor = () => {
    if (progressReached >= 100) return 'bg-green-500';
    if (progressReached >= 60) return 'bg-blue-500';
    if (progressReached >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden max-w-md">
      {/* Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-default text-center">
        <h2 className="text-xl font-bold mb-1">Run Complete</h2>
        <div className="text-2xl mb-1">{renderStars()}</div>
        <div className="text-sm text-secondary">{rating.title}</div>
      </div>

      {/* Ending Narrative */}
      <div className="px-4 py-3 border-b border-default">
        <p className="text-sm italic text-secondary">
          "{endingNarrative}"
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progressReached}%</span>
          </div>
          <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all`}
              style={{ width: `${progressReached}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{turnsSurvived}</div>
            <div className="text-xs text-secondary">Turns</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{itemsFound}</div>
            <div className="text-xs text-secondary">Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{threatsDefeated}</div>
            <div className="text-xs text-secondary">Threats</div>
          </div>
        </div>

        {/* Items Found */}
        {itemsList.length > 0 && (
          <div className="text-sm">
            <div className="text-secondary mb-1">Items found:</div>
            <div className="flex flex-wrap gap-1">
              {itemsList.map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-surface-secondary rounded text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seed */}
      <div className="px-4 py-2 bg-surface-secondary border-t border-default">
        <div className="flex items-center justify-between">
          <span className="text-xs text-secondary">Seed: {seed}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-default space-y-2">
        <button
          onClick={handleCopyChallenge}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded font-medium hover:opacity-90"
        >
          {copied ? '✓ Copied!' : '📋 Copy Challenge'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onNewRun}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            🎮 New Run
          </button>
          <button
            onClick={onBrowseTemplates}
            className="flex-1 px-4 py-2 bg-surface-secondary text-secondary rounded hover:bg-surface-tertiary"
          >
            📚 Templates
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndRunCard;
