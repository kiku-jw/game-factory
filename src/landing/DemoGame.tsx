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
    const [showBridge, setShowBridge] = useState(false);

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
        <div id="demo-section" className="w-full max-w-6xl mx-auto p-4 lg:p-8">
            <div className="space-y-6">
                <div className="relative min-h-[600px] glass-morphism rounded-3xl overflow-hidden p-0 border border-primary/20 bg-black/40 shadow-2xl">
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
                            className="flex justify-center items-center h-full min-h-[500px]"
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
                                <div className="w-full h-full p-4 lg:p-12">
                                    <ArcadeCard
                                        {...widgetState.arcade}
                                        onChoice={(id) => driver.callTool('act', { actionId: id, runRef: widgetState.arcade?.runRef, clientTurn: 1 })}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Technical Bridge Toggle */}
            <div className="fixed bottom-4 right-4 z-[60]">
                <button
                    onClick={() => setShowBridge(!showBridge)}
                    className="glass-morphism px-4 py-2 rounded-full border border-primary/30 text-xs font-mono text-primary hover:bg-primary/10 transition-colors uppercase tracking-widest"
                >
                    {showBridge ? 'Hide Intel' : 'Show Technical Intel'}
                </button>
            </div>

            {showBridge && (
                <div className="fixed bottom-16 right-4 w-80 z-[60] bg-black/90 border border-white/10 rounded-xl p-4 font-mono text-[9px] h-64 overflow-y-auto space-y-1 shadow-2xl backdrop-blur-xl">
                    <div className="text-text-secondary uppercase mb-2 border-b border-white/5 pb-1">Bridge Feed</div>
                    {logs.map((log, i) => (
                        <div key={i} className={log.includes('CALL') ? 'text-primary' : 'text-green-500 opacity-80'}>
                            {log}
                        </div>
                    ))}
                    <div className="pt-4 text-white/20">
                        MOCK_SESSION_ACTIVE
                    </div>
                </div>
            )}
        </div>
    );
}
