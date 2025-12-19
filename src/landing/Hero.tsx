import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Share2, ShieldCheck } from 'lucide-react';

interface HeroProps {
    onStartGame: () => void;
}

export function Hero({ onStartGame }: HeroProps) {
    return (
        <div className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full delay-700" />
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-primary">
                        <Zap size={14} /> Version 0.1.0 Ready
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tighter">
                        Build Endless <br />
                        <span className="gradient-text">AI Adventures</span> <br />
                        In Two Clicks.
                    </h1>

                    <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
                        Game Factory is an AI-native engine that generates unique text-adventure experiences.
                        No prompts, no registration, no limits. Just pick a genre and play.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={onStartGame}
                            className="glow-btn px-8 py-4 bg-primary text-white font-bold rounded-lg flex items-center gap-2 group"
                        >
                            Play Demo Now
                            <Gamepad2 className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://github.com/kiku-jw/game-factory"
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg transition-colors"
                        >
                            Explore Code
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                        <div>
                            <div className="text-2xl font-bold font-mono">100%</div>
                            <div className="text-xs text-text-secondary uppercase">AI Generated</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">Zero</div>
                            <div className="text-xs text-text-secondary uppercase">Logging</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">6+</div>
                            <div className="text-xs text-text-secondary uppercase">Genres</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative z-10 glass-morphism rounded-2xl p-2 shadow-2xl overflow-hidden border-primary/20">
                        <div className="bg-surface rounded-xl overflow-hidden aspect-video relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center text-xs font-mono text-primary">
                                    <span>// INITIALIZING_RUN</span>
                                    <span>TURN: 001</span>
                                </div>
                                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse delay-75" />
                                <div className="h-32 w-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                                    <Gamepad2 size={48} className="text-white/20 animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative floating cards */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-6 -right-6 glass-morphism p-4 rounded-lg shadow-xl z-20 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="text-xs font-mono">SAFETY_PASS: 100%</div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-6 -left-6 glass-morphism p-4 rounded-lg shadow-xl z-20 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <Share2 size={18} />
                            </div>
                            <div className="text-xs font-mono">SEED_EXPORTABLE</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Feature section */}
            <div className="max-w-6xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    icon={<Gamepad2 className="text-primary" />}
                    title="Instant Gameplay"
                    description="Pick a template and start playing immediately. No tutorial or prompts required."
                />
                <FeatureCard
                    icon={<Zap className="text-primary" />}
                    title="Adaptive Narrative"
                    description="Every choice ripples through the story, affecting your health, supplies, and threat level."
                />
                <FeatureCard
                    icon={<ShieldCheck className="text-primary" />}
                    title="Privacy First"
                    description="Zero personal data collection. Session-only state with hard-coded 4h retention."
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl glass-morphism space-y-4 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
    );
}
