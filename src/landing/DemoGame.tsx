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

export function DemoGame() {
    const [step, setStep] = useState<WidgetType>('WelcomeCard');
    const [widgetState, setWidgetState] = useState<WidgetState | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showBridge, setShowBridge] = useState(false);
    const [provider, setProvider] = useState<'openai' | 'openrouter'>('openai');
    const openRouterModels = [
        {
            id: 'openai/gpt-5.1-codex',
            label: 'GPT-5.1 Codex — frontier coding + gameplay tuning',
        },
        {
            id: 'anthropic/claude-4.2-sonnet',
            label: 'Claude 4.2 Sonnet — balanced design + reasoning',
        },
        {
            id: 'deepseek/deepseek-r1',
            label: 'DeepSeek R1 — fast iterative prototyping',
        },
        {
            id: 'meta-llama/llama-4.1-70b-instruct:free',
            label: 'Llama 4.1 70B — free open community baseline',
        },
    ] as const;
    const [openRouterModel, setOpenRouterModel] = useState<typeof openRouterModels[number]['id']>(openRouterModels[0].id);
    const [apiKey, setApiKey] = useState('');
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
        const storedModel = localStorage.getItem('game-factory-openrouter-model') as typeof openRouterModels[number]['id'] | null;
        if (storedProvider) {
            setProvider(storedProvider);
        }
        if (storedKey) {
            setApiKey(storedKey);
        }
        if (storedModel) {
            setOpenRouterModel(storedModel);
        }
    }, []);

    useEffect(() => {
        driver.setCredentials(provider, apiKey.trim(), openRouterModel);
        localStorage.setItem('game-factory-provider', provider);
        localStorage.setItem('game-factory-api-key', apiKey);
        if (provider === 'openrouter') {
            localStorage.setItem('game-factory-openrouter-model', openRouterModel);
        }
    }, [driver, provider, apiKey, openRouterModel]);

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
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-secondary font-semibold">
                                <span className="w-2 h-2 rounded-full bg-primary" /> Choose your OpenRouter model
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {openRouterModels.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setOpenRouterModel(model.id)}
                                        className={`text-left p-3 rounded-xl border transition-colors bg-white/5 hover:bg-white/10 ${openRouterModel === model.id ? 'border-primary/60 shadow-lg shadow-primary/10' : 'border-white/10'}`}
                                        disabled={!canStartRun}
                                    >
                                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${openRouterModel === model.id ? 'bg-primary' : 'bg-white/30'}`} />
                                            {model.label}
                                        </div>
                                        <p className="text-[11px] text-text-secondary mt-1 break-words">{model.id}</p>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-text-secondary">Best picks for 23 Dec 2025. Llama 4.1 70B is the free community option.</p>
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
