import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './landing/Hero';
import { DemoGame } from './landing/DemoGame';
import { Legal } from './landing/Legal';
import { Shield, FileText, Gamepad2, Github } from 'lucide-react';

type Page = 'home' | 'demo' | 'privacy' | 'terms';

export default function App() {
    const [page, setPage] = useState<Page>('home');

    // Handle back button for SPA feel
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.hash.replace('#', '') || 'home';
            setPage(path as Page);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (to: Page) => {
        setPage(to);
        window.location.hash = to === 'home' ? '' : to;
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen flex flex-col selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass-morphism px-6 py-4 flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('home')}
                >
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                        <Gamepad2 className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tighter uppercase font-mono">Game Factory</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Features</button>
                    <button onClick={() => navigate('demo')} className="hover:text-primary transition-colors text-primary font-bold">Live Demo</button>
                    <a href="https://github.com/kiku-jw/game-factory" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Github size={18} />
                        GitHub
                    </a>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-20">
                <AnimatePresence mode="wait">
                    {page === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Hero onStartGame={() => navigate('demo')} />
                        </motion.div>
                    )}

                    {page === 'demo' && (
                        <motion.div
                            key="demo"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="py-12 px-6"
                        >
                            <DemoGame />
                        </motion.div>
                    )}

                    {(page === 'privacy' || page === 'terms') && (
                        <motion.div
                            key="legal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Legal type={page} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="glass-morphism mt-auto px-6 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="font-bold text-lg font-mono uppercase">Game Factory</div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            AI-native endless game generator. <br />
                            Part of the KikuAI ecosystem.
                        </p>
                    </div>

                    <div>
                        <div className="font-bold mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-primary" /> Legal
                        </div>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li><button onClick={() => navigate('privacy')} className="hover:text-white">Privacy Policy</button></li>
                            <li><button onClick={() => navigate('terms')} className="hover:text-white">Terms of Service</button></li>
                        </ul>
                    </div>

                    <div>
                        <div className="font-bold mb-4 flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Submission
                        </div>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li><a href="https://github.com/kiku-jw/game-factory/blob/main/SUBMISSION.md" target="_blank" rel="noreferrer" className="hover:text-white">Full Checklist</a></li>
                            <li><a href="https://github.com/kiku-jw/game-factory/blob/main/TESTING_GUIDE.md" target="_blank" rel="noreferrer" className="hover:text-white">Testing Guide</a></li>
                        </ul>
                    </div>

                    <div>
                        <div className="font-bold mb-4 uppercase text-xs tracking-widest text-text-secondary">Built with</div>
                        <div className="flex gap-4 items-center opacity-50 grayscale hover:grayscale-0 transition-all">
                            <img src="https://vitejs.dev/logo.svg" alt="Vite" className="w-6" />
                            <img src="https://reactjs.org/favicon.ico" alt="React" className="w-6" />
                            <img src="https://tailwindcss.com/favicons/favicon-32x32.png?v=3" alt="Tailwind" className="w-6" />
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-text-secondary uppercase tracking-widest">
                    © 2025 KikuAI Engineering. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
