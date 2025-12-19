// Game Factory - WelcomeCard (Magic Prompt Reality)
// A prompt-first entry point for game synthesis

import React, { useState } from 'react';
import { Sparkles, Dice5, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeCardProps {
  onStartRun: (result: unknown) => void;
  existingRun?: boolean;
}

const SUGGESTIONS = [
  "A cyberpunk platformer where I am a hackers drone",
  "Ocean exploration arcade with a tiny sub",
  "Escape from a haunted digital factory",
  "High-speed chase on a neon highway",
  "Retro pixel-art knight in a lava castle",
];

export function WelcomeCard({ onStartRun, existingRun }: WelcomeCardProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt && !customPrompt) return;

    setLoading(true);
    try {
      const result = await window.openai.callTool('start_run', { prompt: finalPrompt });
      onStartRun(result);
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    setPrompt(randomPrompt);
    handleStart(randomPrompt);
  };

  return (
    <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <header className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest mb-4"
          >
            <Sparkles size={12} />
            AI Synthesis Engine v0.3.0
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Build your Arcade Game</h2>
          <p className="text-text-secondary text-sm">Describe your mission. We'll synthesize the level in seconds.</p>
        </header>

        <div className="space-y-6">
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A fast-paced shooter in space..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none group-hover:border-white/20"
              disabled={loading}
            />

            <AnimatePresence>
              {prompt.length > 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 right-4"
                >
                  <button
                    onClick={() => handleStart()}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20"
                  >
                    <Play size={16} fill="currentColor" />
                    BUILD
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary mb-2" size={32} />
                <span className="text-xs font-mono text-primary animate-pulse tracking-widest uppercase">Synthesizing World...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSurpriseMe}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
            >
              <Dice5 size={18} className="text-purple-400 group-hover:rotate-45 transition-transform" />
              Surprise Me
            </button>

            <div className="flex-[2] flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-xl overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-white/20 uppercase font-bold px-2 shrink-0">Try</span>
              {["Fantasy", "Sci-Fi", "Cyberpunk", "Horror"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setPrompt(prev => prev + (prev ? " " : "") + tag)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-text-secondary whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {existingRun && (
          <footer className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <button
              onClick={() => onStartRun({ continue: true })}
              className="text-xs text-text-secondary hover:text-white transition-colors underline underline-offset-4"
            >
              Resume previous session
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default WelcomeCard;
