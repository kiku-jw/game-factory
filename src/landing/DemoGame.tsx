import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    WelcomeCard,
    SceneCard,
    ConsequenceCard,
    EndRunCard
} from '@widgets';
import '../shared/demoDriver'; // Ensure driver is initialized

type WidgetType = 'WelcomeCard' | 'SceneCard' | 'ConsequenceCard' | 'EndRunCard';

export function DemoGame() {
    const [currentWidget, setCurrentWidget] = useState<WidgetType>('WelcomeCard');
    const [widgetData, setWidgetData] = useState<any>({});
    const [logs, setLogs] = useState<{ timestamp: string, type: string, message: string }[]>([]);

    // Hook into the demo driver to capture logs
    useEffect(() => {
        const originalCallTool = window.openai.callTool;
        window.openai.callTool = async (name: string, args: Record<string, unknown>) => {
            addLog('call', `Tool: ${name} (${JSON.stringify(args)})`);
            const res = await originalCallTool.apply(window.openai, [name, args]);
            addLog('res', `Result: ${JSON.stringify(res.structuredContent).substring(0, 100)}...`);
            return res;
        };
    }, []);

    const addLog = (type: string, message: string) => {
        setLogs(prev => [{
            timestamp: new Date().toLocaleTimeString(),
            type,
            message
        }, ...prev].slice(0, 10));
    };

    const handleWidgetTransition = (result: any) => {
        const template = result._meta?.['openai/outputTemplate'] || 'SceneCard';

        // In our implementation, we map templates to component names
        setWidgetData({
            ...result.structuredContent,
            ...result._meta
        });

        setCurrentWidget(template as WidgetType);
    };

    const handleRunEnded = (result: any) => {
        setWidgetData({
            ...result.structuredContent,
            ...result._meta
        });
        setCurrentWidget('EndRunCard');
    };

    const handleReset = () => {
        setCurrentWidget('WelcomeCard');
        setWidgetData({});
        window.openai.setWidgetState({});
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold font-mono uppercase tracking-tighter">Live Game Player</h2>
                <p className="text-text-secondary">Experience the AI engine in real-time. This player uses the same widgets and logic as the ChatGPT Store app.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                {/* Widget Container */}
                <div className="flex-grow flex justify-center w-full min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWidget}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentWidget === 'WelcomeCard' && (
                                <WelcomeCard
                                    onStartRun={handleWidgetTransition}
                                    existingRun={!!window.openai.widgetState.runRef}
                                />
                            )}
                            {currentWidget === 'SceneCard' && (
                                <SceneCard
                                    {...widgetData}
                                    onChoice={handleWidgetTransition}
                                    onRunEnded={handleRunEnded}
                                />
                            )}
                            {currentWidget === 'ConsequenceCard' && (
                                <ConsequenceCard
                                    {...widgetData}
                                    onResolve={handleWidgetTransition}
                                />
                            )}
                            {currentWidget === 'EndRunCard' && (
                                <EndRunCard
                                    {...widgetData}
                                    onRestart={handleReset}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Technical Sidebar / Logs */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    <div className="glass-morphism rounded-xl p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Technical Logs</h3>
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        </div>
                        <div className="space-y-3 font-mono text-[10px] leading-tight">
                            {logs.length === 0 ? (
                                <div className="text-text-secondary italic">Waiting for tool calls...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="border-l border-white/10 pl-3 pb-3 space-y-1">
                                        <div className="flex justify-between items-center opacity-50">
                                            <span>[{log.timestamp}]</span>
                                            <span className={log.type === 'call' ? 'text-primary' : 'text-blue-400'}>
                                                {log.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="break-all">{log.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 text-[10px] text-text-secondary leading-normal">
                        <span className="text-white font-bold block mb-1">PRO-TIP FOR REVIEWERS:</span>
                        All tools are retry-safe (idempotent). We use a `clientTurn` check to prevent duplicate execution during network lag.
                    </div>
                </div>
            </div>
        </div>
    );
}
