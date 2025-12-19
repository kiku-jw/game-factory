
import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

interface DynamicGameLoaderProps {
    code: string;
    onReset: () => void;
}

export function DynamicGameLoader({ code, onReset }: DynamicGameLoaderProps) {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        try {
            // Enhanced wrapping for multi-statement AI code
            const body = code.trim().startsWith('(') || code.trim().startsWith('function') || code.trim().startsWith('arg =>') || code.trim().startsWith('() =>')
                ? `return (${code})`
                : code;

            const factory = new Function('React', 'Lucide', 'motion', `
                const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
                const LucideIcons = Lucide;
                ${body}
            `);
            const DynamicComp = factory(React, LucideIcons, motion);
            if (typeof DynamicComp !== 'function') {
                throw new Error('Synthesis did not return a valid React component function.');
            }
            setComponent(() => DynamicComp);
            setError(null);
        } catch (err: any) {
            console.error('[DynamicGameLoader] Code execution error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [code]);

    if (loading) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-primary font-mono text-xs tracking-widest uppercase animate-pulse">
                    Synthesizing Reality...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center w-full">
                <LucideIcons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Synthesis Error</h3>
                <p className="text-text-secondary text-sm mb-6">{error}</p>
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!Component) return null;

    return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black/40 rounded-3xl border border-white/10 backdrop-blur-xl relative group">
            <div className="absolute top-4 left-4 flex gap-2 z-20">
                <div className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-[10px] text-primary uppercase font-bold tracking-widest">
                    AI_CODE_ACTIVE
                </div>
            </div>

            <div className="w-full h-full flex items-center justify-center p-4">
                <Component />
            </div>
        </div>
    );
}
