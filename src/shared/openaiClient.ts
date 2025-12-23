/// <reference types="vite/client" />

type Provider = 'openai' | 'openrouter';

interface ProviderOptions {
    provider: Provider;
    apiKey: string;
    modelOverrides?: Partial<{ expansion: string; coding: string }>;
}

/**
 * EXPANSION_SYSTEM_PROMPT:
 * Used to turn a simple idea into a detailed technical specification.
 */
const EXPANSION_SYSTEM_PROMPT = `You are a Lead Game Architect at KikuAI. Your task is to expand a user's prompt into a high-fidelity implementation spec.

YOUR GOAL: Capture the ESSENCE and "JUICE" of the idea.
OUTPUT: A structured JSON with:
1. "concept": The core game loop and "hook".
2. "mechanics": Specific rules, win/loss conditions, difficulty progression.
3. "visuals": Detailed aesthetic instructions (colors, gradients, screen shake, particles).
4. "audio": Specific synthesized sound effects to generate (jump, explode, powerup).
5. "tech": Specific React state and logic requirements.

Be bold. If they ask for "Void Runner", suggest parallax backgrounds, neon glows, and glitch effects.`;

/**
 * CODING_SYSTEM_PROMPT:
 * Used to implement the expanded specification.
 */
const CODING_SYSTEM_PROMPT = `You are the KikuAI Ultra-Synthesis Engine. Generate a high-fidelity React arcade game based on the provided technical specification.

STRICT TECHNICAL RULES:
1. CODE FORMAT: Return a valid JavaScript string as the "code" property. 
   - If writing a single function expression: () => { ... }
   - If writing a full block: const Game = () => { ... }; return Game;
   - DO NOT include markdown code blocks (\`\`\`) in the JSON string.
2. LIBRARIES: Use ONLY React.createElement() - NO JSX. 
   Available globals: React, LucideIcons, motion.
   IMPORTANT: Destructure hooks (useState, useEffect, etc.) from React if you need them.
3. JUICINESS: 
   - Screen Shake: Implement a shakeIntensity state.
   - Particles: Use a canvas-based particle system for explosions or trails.
   - Smooth Lerp: Everything should move smoothly, not frame-by-frame jumps.
   - Aesthetics: Neon shadows, glassmorphism UI, procedural textures (Canvas noise/gradients).
4. AUDIO: Every interaction (jump/hit/score) MUST trigger a Web Audio API sound.
   EXAMPLE SFX HELPER: 
   const playSfx = (freq, type='square', d=0.1) => {
     const c = new (window.AudioContext || window.webkitAudioContext)();
     const o = c.createOscillator(); const g = c.createGain();
     o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
     o.connect(g); g.connect(c.destination);
     o.start(); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + d);
     o.stop(c.currentTime + d);
   };

OUTPUT: A JSON object with "code" (string) and "preview" (string).`;

function buildProviderConfig({ provider, apiKey, modelOverrides }: ProviderOptions) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    const baseUrl = provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1'
        : 'https://api.openai.com/v1';

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };

    if (provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Game Factory';
    }

    const models = provider === 'openrouter'
        ? {
            expansion: 'anthropic/claude-3.5-sonnet',
            coding: 'openai/gpt-4.1',
        }
        : {
            expansion: 'gpt-4o-mini',
            coding: 'gpt-4o',
        };

    if (modelOverrides?.expansion) models.expansion = modelOverrides.expansion;
    if (modelOverrides?.coding) models.coding = modelOverrides.coding;

    return { baseUrl, headers, models };
}

export async function generateNarrative(prompt: string, options: ProviderOptions): Promise<string> {
    const { baseUrl, headers, models } = buildProviderConfig(options);

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: models.expansion,
                messages: [
                    { role: 'system', content: 'You are a game master. Generate immersive narrative summaries.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
            }),
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('[OpenAI] Narrative error:', error);
        return '';
    }
}

export async function generateGameCode(
    userPrompt: string,
    options: ProviderOptions,
): Promise<{ code: string; preview: string }> {
    const { baseUrl, headers, models } = buildProviderConfig(options);

    try {
        // STEP 1: EXPANSION - Think about the game first
        console.log('[Synthesis] Step 1: Expanding prompt...');
        const expansionResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: models.expansion,
                messages: [
                    { role: 'system', content: EXPANSION_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const expansionData = await expansionResponse.json();
        const spec = expansionData.choices[0].message.content;
        console.log('[Synthesis] Expansion result:', spec);

        // STEP 2: IMPLEMENTATION - Code the spec
        console.log('[Synthesis] Step 2: Implementing code...');
        const codeResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: models.coding,
                messages: [
                    { role: 'system', content: CODING_SYSTEM_PROMPT },
                    { role: 'user', content: `Implement this game specification: ${spec}` }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const codeData = await codeResponse.json();
        return JSON.parse(codeData.choices[0].message.content);

    } catch (error) {
        console.error('[OpenAI] Synthesis error:', error);
        return { code: '() => React.createElement("div", {}, "Synthesis error")', preview: 'Error' };
    }
}
