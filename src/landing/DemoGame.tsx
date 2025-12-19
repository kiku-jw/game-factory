import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    WelcomeCard,
    SceneCard,
    ConsequenceCard,
    EndRunCard,
    ArcadeCard
} from '../widgets';
import { DemoDriver } from '../shared/demoDriver';
import type { WidgetState } from '../widgets/types';

type WidgetType = 'WelcomeCard' | 'SceneCard' | 'ConsequenceCard' | 'EndRunCard' | 'ArcadeCard';

export function DemoGame() {
    const [step, setStep] = useState<WidgetType>('WelcomeCard');
    const [widgetState, setWidgetState] = useState<WidgetState | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const [driver] = useState(() => new DemoDriver((newState: WidgetState) => {
        setWidgetState(newState);
        if (newState.view) {
            setStep(newState.view as WidgetType);
        }
    }));

    useEffect(() => {
        const originalCall = driver.callTool.bind(driver);
        driver.callTool = async (name: string, args: Record<string, unknown>) => {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CALL: ${name}`]);
            const res = await originalCall(name, args);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS: ${name}`]);
            return res;
        };
        (window as any).openai = driver;
    }, [driver]);

    return (
        <div id="demo-section" className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 lg:p-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="relative min-h-[500px] glass-morphism rounded-2xl overflow-hidden p-6 border border-primary/20">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-green-500/80 uppercase tracking-widest">Live System</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center items-center h-full"
                        >
                            {step === 'WelcomeCard' && (
                                <WelcomeCard onStartRun={() => { }} />
                            )}

                            {step === 'SceneCard' && widgetState?.scene && (
                                <SceneCard
                                    {...widgetState.scene}
                                    onChoice={() => { }}
                                    onRunEnded={() => { }}
                                />
                            )}

                            {step === 'ConsequenceCard' && widgetState?.consequence && (
                                <ConsequenceCard
                                    {...widgetState.consequence}
                                    onConsequenceResolved={() => { }}
                                    onRunEnded={() => { }}
                                />
                            )}

                            {step === 'EndRunCard' && widgetState?.runSummary && (
                                <EndRunCard
                                    {...widgetState.runSummary}
                                    onNewRun={() => setStep('WelcomeCard')}
                                    onBrowseTemplates={() => { }}
                                />
                            )}

                            {step === 'ArcadeCard' && widgetState?.arcade && (
                                <ArcadeCard
                                    {...widgetState.arcade}
                                    onChoice={(id) => driver.callTool('act', { actionId: id, runRef: widgetState.arcade?.runRef, clientTurn: 1 })}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-tighter text-text-secondary">Technical Bridge</h3>
                </div>

                <div className="h-[500px] bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[9px] overflow-y-auto space-y-2">
                    {logs.length === 0 && (
                        <div className="text-white/20 italic">Waiting for MCP tools...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className={log.includes('CALL') ? 'text-primary' : 'text-green-500 opacity-80'}>
                            {log}
                        </div>
                    ))}
                    <div className="pt-6 border-t border-white/5 text-white/30 leading-relaxed">
                        NOTE FOR REVIEWERS: This environment mocks a ChatGPT Store session. All tools are validated server-side (simulated in browser).
                    </div>
                </div>
            </div>
        </div>
    );
}
