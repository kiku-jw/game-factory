import React from 'react';
import { motion } from 'framer-motion';

export function Legal({ type }: { type: 'privacy' | 'terms' }) {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism rounded-3xl p-8 md:p-12 space-y-8"
            >
                {type === 'privacy' ? (
                    <>
                        <h1 className="text-4xl font-bold font-mono uppercase tracking-tighter">Privacy Policy</h1>
                        <div className="space-y-6 text-text-secondary leading-relaxed">
                            <p>Last Updated: December 2025</p>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">1. Data Collection</h2>
                                <p>Game Factory does not collect personally identifiable information (PII). We only store the minimum data required to maintain your game session (game state, choices, and settings).</p>
                            </section>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">2. Data Retention</h2>
                                <p>Game data is stored in-memory during your session. All data is automatically deleted after 4 hours of inactivity or when you manually end the game.</p>
                            </section>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">3. Third-Party Services</h2>
                                <p>Our AI-powered narratives are generated using OpenAI's API. No personal data is sent to OpenAI; only game-specific parameters and the seed code.</p>
                            </section>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-bold font-mono uppercase tracking-tighter">Terms of Service</h1>
                        <div className="space-y-6 text-text-secondary leading-relaxed">
                            <p>Last Updated: December 2025</p>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
                                <p>By using Game Factory, you agree to these terms. This service is provided "as is" for entertainment and demonstration purposes.</p>
                            </section>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">2. Age Requirement</h2>
                                <p>Game Factory is intended for users aged 13 and above. Content is filtered for appropriateness, but users under 13 must have parental consent.</p>
                            </section>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-white">3. Usage Limits</h2>
                                <p>To ensure fair access for everyone, we might implement rate limits. Automated scraping or abuse of the API is prohibited.</p>
                            </section>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
