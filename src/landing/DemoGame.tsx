import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    WelcomeCard,
    SceneCard,
    ConsequenceCard,
    EndRunCard,
    ArcadeCard
} from '../widgets';
import { DynamicGameLoader } from '../widgets/DynamicGameLoader';
import { DemoDriver } from '../shared/demoDriver';
import type { WidgetState } from '../widgets/types';

type WidgetType = 'WelcomeCard' | 'SceneCard' | 'ConsequenceCard' | 'EndRunCard' | 'ArcadeCard';

const OPENROUTER_MODEL_CHOICES = [
    {
        value: 'anthropic/claude-3.5-sonnet',
        label: 'Claude 3.5 Sonnet — premium creativity & reasoning',
    },
    {
        value: 'deepseek/deepseek-coder-v2.5',
        label: 'DeepSeek Coder v2.5 — code-focused for tight gameplay loops',
    },
    {
        value: 'meta-llama/llama-3.1-8b-instruct:free',
        label: 'Llama 3.1 8B Instruct — free community model (good baseline)',
    },
];

export function DemoGame() {
    const [step, setStep] = useState<WidgetType>('WelcomeCard');
    const [widgetState, setWidgetState] = useState<WidgetState | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showBridge, setShowBridge] = useState(false);
    const [provider, setProvider] = useState<'openai' | 'openrouter'>('openai');
    const [apiKey, setApiKey] = useState('');
    const [openrouterModel, setOpenrouterModel] = useState(OPENROUTER_MODEL_CHOICES[0].value);
    const apiInputRef = useRef<HTMLInputElement | null>(null);

    const [driver] = useState(() => new DemoDriver((newState: WidgetState) => {
        setWidgetState(newState);
        if (newState.view) {
            setStep(newState.view as WidgetType);
        }
    }));

    useEffect(() => {
        const storedProvider = localStorage.getItem('game-factory-provider') as 'openai' | 'openrouter' | null;
        const storedKey = localStorage.getItem('game-factory-api-key');
        const storedOpenrouterModel = localStorage.getItem('game-factory-openrouter-model');
        if (storedProvider) {
            setProvider(storedProvider);
        }
        if (storedKey) {
            setApiKey(storedKey);
        }
        if (storedOpenrouterModel) {
            setOpenrouterModel(storedOpenrouterModel);
        }
    }, []);

    useEffect(() => {
        const modelOverrides = provider === 'openrouter'
            ? { expansion: openrouterModel, coding: openrouterModel }
            : undefined;
        driver.setCredentials(provider, apiKey.trim(), modelOverrides);
        localStorage.setItem('game-factory-provider', provider);
        localStorage.setItem('game-factory-api-key', apiKey);
        if (provider === 'openrouter') {
            localStorage.setItem('game-factory-openrouter-model', openrouterModel);
        }
    }, [driver, provider, apiKey, openrouterModel]);

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

    const canStartRun = apiKey.trim().length > 0;

    return (
        <div id="demo-section" className="w-full max-w-6xl mx-auto p-4 lg:p-8">
            <div className="space-y-6">
                <div className="glass-morphism border border-white/10 rounded-2xl p-4 lg:p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Choose a provider</div>
                            <p className="text-text-secondary text-xs">Bring your own OpenAI or OpenRouter key. Stored locally for this session.</p>
                        </div>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            {(['openai', 'openrouter'] as const).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setProvider(option)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${provider === option ? 'bg-primary text-black shadow-lg' : 'text-text-secondary hover:text-white'}`}
                                >
                                    {option === 'openai' ? 'OpenAI' : 'OpenRouter'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            ref={apiInputRef}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'OpenRouter'} API key`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                        />
                        <div className="text-[11px] text-text-secondary flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${canStartRun ? 'bg-green-500' : 'bg-yellow-400'}`} />
                            {canStartRun ? 'Ready to synthesize' : 'Add a valid key to start'}
                        </div>
                    </div>

                    {provider === 'openrouter' && (
                        <div className="flex flex-col gap-2">
                            <div className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em]">OpenRouter model</div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <select
                                    value={openrouterModel}
                                    onChange={(e) => setOpenrouterModel(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 flex-1"
                                >
                                    {OPENROUTER_MODEL_CHOICES.map(choice => (
                                        <option key={choice.value} value={choice.value} className="bg-black text-white">
                                            {choice.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-text-secondary max-w-sm leading-relaxed">
                                    Pick a tuned model for game design & code. We recommend Claude for creative briefs, DeepSeek Coder for tight mechanics, or the free Llama tier to try it out.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

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
                                <WelcomeCard
                                    canStart={canStartRun}
                                    provider={provider}
                                    onMissingKey={() => apiInputRef.current?.focus()}
                                    onStartRun={(res) => {
                                        if (res && (res as any).continue) {
                                            // Handle resume if needed
                                        }
                                    }}
                                />
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
                                    {widgetState.arcade.code ? (
                                        <DynamicGameLoader
                                            code={widgetState.arcade.code}
                                            onReset={() => setStep('WelcomeCard')}
                                        />
                                    ) : (
                                        <ArcadeCard
                                            {...widgetState.arcade}
                                            onChoice={(id) => driver.callTool('act', { actionId: id, runRef: widgetState.arcade?.runRef, clientTurn: 1 })}
                                        />
                                    )}
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
