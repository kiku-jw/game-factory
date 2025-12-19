// Game Factory - WelcomeCard Widget
// Initial screen with genre selection

import React, { useState } from 'react';

interface WelcomeCardProps {
  onStartRun: (result: unknown) => void;
  existingRun?: boolean;
}

const GENRES = [
  { id: 'fantasy', label: 'Fantasy', icon: '🏰' },
  { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
  { id: 'mystery', label: 'Mystery', icon: '🔍' },
  { id: 'horror-lite', label: 'Horror', icon: '🌙' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🌆' },
  { id: 'surreal', label: 'Surreal', icon: '👁️' },
];

const TONES = [
  { id: 'light', label: 'Light' },
  { id: 'serious', label: 'Serious' },
];

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'normal', label: 'Normal' },
  { id: 'hard', label: 'Hard' },
];

export function WelcomeCard({ onStartRun, existingRun }: WelcomeCardProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [tone, setTone] = useState('light');
  const [length, setLength] = useState('medium');
  const [difficulty, setDifficulty] = useState('normal');
  const [format, setFormat] = useState('quest');
  const [loading, setLoading] = useState(false);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    // Update widget state locally (no tool call yet)
    window.openai.setWidgetState({ selectedGenre: genreId });
  };

  const handleSurpriseMe = async () => {
    setLoading(true);
    try {
      const result = await window.openai.callTool('start_run', { surprise: true });
      await window.openai.setWidgetState({
        runRef: (result._meta as any)?.runRef,
        lastKnownTurn: 1,
      });
      onStartRun(result);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdventure = async () => {
    if (!selectedGenre) return;

    setLoading(true);
    try {
      const result = await window.openai.callTool('start_run', {
        genre: selectedGenre,
        tone,
        length,
        difficulty,
        format,
      });
      await window.openai.setWidgetState({
        runRef: (result._meta as any)?.runRef,
        lastKnownTurn: 1,
      });
      onStartRun(result);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    // Continue with existing run from widgetState
    const state = window.openai.widgetState;
    if (state.runRef) {
      // Just trigger a refresh/continue
      onStartRun({ continue: true, runRef: state.runRef });
    }
  };

  // Show Quick Setup if genre selected
  if (selectedGenre) {
    return (
      <div className="bg-surface border border-default rounded-lg p-4 max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {GENRES.find(g => g.id === selectedGenre)?.icon}{' '}
          {GENRES.find(g => g.id === selectedGenre)?.label} Adventure
        </h2>

        {/* Tone */}
        <div className="mb-3">
          <label className="text-sm text-secondary mb-1 block">Tone</label>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-3 py-1 rounded text-sm ${tone === t.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary hover:bg-surface-tertiary'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div className="mb-3">
          <label className="text-sm text-secondary mb-1 block">Length</label>
          <div className="flex gap-2">
            {LENGTHS.map(l => (
              <button
                key={l.id}
                onClick={() => setLength(l.id)}
                className={`px-3 py-1 rounded text-sm ${length === l.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary hover:bg-surface-tertiary'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-3">
          <label className="text-sm text-secondary mb-1 block">Game Format</label>
          <div className="flex gap-2">
            {[
              { id: 'quest', label: 'Quest', icon: '📖' },
              { id: 'arcade', label: 'Arcade', icon: '🕹️' },
              { id: 'puzzle', label: 'Logic', icon: '🧩' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex-1 px-3 py-2 rounded text-sm flex flex-col items-center gap-1 ${format === f.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-secondary border border-transparent hover:bg-surface-tertiary'
                  }`}
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-[10px] uppercase font-bold">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm text-secondary mb-1 block">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`px-3 py-1 rounded text-sm ${difficulty === d.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary hover:bg-surface-tertiary'
                  }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className="px-4 py-2 text-sm text-secondary hover:text-primary"
          >
            ← Back
          </button>
          <button
            onClick={handleStartAdventure}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Starting...' : '▶ Start Adventure'}
          </button>
        </div>
      </div >
    );
  }

  // Genre Selection Screen
  return (
    <div className="bg-surface border border-default rounded-lg p-4 max-w-md">
      <h2 className="text-lg font-semibold mb-1">🎮 Game Factory</h2>
      <p className="text-sm text-secondary mb-4">Create your adventure in seconds</p>

      {/* Genre Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {GENRES.map(genre => (
          <button
            key={genre.id}
            onClick={() => handleGenreSelect(genre.id)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg transition-colors"
          >
            <span className="text-xl">{genre.icon}</span>
            <span>{genre.label}</span>
          </button>
        ))}
      </div>

      {/* Surprise Me */}
      <button
        onClick={handleSurpriseMe}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 mb-3"
      >
        {loading ? 'Creating...' : '🎲 Surprise Me'}
      </button>

      {/* Secondary Actions */}
      <div className="flex gap-2 text-sm">
        <button className="flex-1 px-3 py-2 text-secondary hover:text-primary">
          📚 Browse Templates
        </button>
        {existingRun && (
          <button
            onClick={handleContinue}
            className="flex-1 px-3 py-2 text-secondary hover:text-primary"
          >
            ▶ Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default WelcomeCard;
