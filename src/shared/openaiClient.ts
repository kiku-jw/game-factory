/// <reference types="vite/client" />

export async function generateNarrative(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.warn('[OpenAI] No API key found, using fallback.');
        return '';
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a game master for a text-adventure game. Generate immersive but concise narrative summaries.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('[OpenAI] Error generating narrative:', error);
        return '';
    }
}

export async function generateGameCode(prompt: string): Promise<{ code: string; preview: string }> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // DEBUG: check if key is present (not exposing full key)
    if (apiKey) console.log('[Synthesis] API Key detected, length:', apiKey.length);
    else console.warn('[Synthesis] API Key MISSING in this build.');

    if (!apiKey) {
        console.warn('[OpenAI] No API key, using playable fallback.');
        return {
            code: `() => {
                const [score, setScore] = React.useState(0);
                const [gameOver, setGameOver] = React.useState(false);
                const [y, setY] = React.useState(150);
                const [v, setV] = React.useState(0);
                const [obs, setObs] = React.useState({ x: 300, h: 100 });

                React.useEffect(() => {
                    if (gameOver) return;
                    const it = setInterval(() => {
                        setY(y => {
                            const next = y + v;
                            if (next > 270 || next < 0) setGameOver(true);
                            return next;
                        });
                        setV(v => v + 0.35);
                        setObs(o => {
                            if (o.x < -30) {
                                setScore(s => s + 1);
                                return { x: 400, h: 50 + Math.random() * 100 };
                            }
                            if (o.x < 80 && o.x > 20 && (y < o.h || y > o.h + 80)) {
                                if (y > 300 - o.h) setGameOver(true);
                            }
                            return { ...o, x: o.x - 4 };
                        });
                    }, 20);
                    return () => clearInterval(it);
                }, [v, y, gameOver]);

                const jump = () => {
                    if (gameOver) {
                        setScore(0); setGameOver(false); setY(150); setV(0); setObs({ x: 300, h: 100 });
                        return;
                    }
                    setV(-6);
                };

                return React.createElement('div', { 
                    onClick: jump,
                    style: { 
                        width: '100%', height: '350px', background: '#0a0a0a', 
                        position: 'relative', overflow: 'hidden', cursor: 'pointer',
                        borderRadius: '16px', border: '1px solid #333'
                    } 
                }, [
                    React.createElement('div', { style: { position: 'absolute', top: 20, right: 20, color: '#333', fontSize: '10px' } }, 'v0.3.1-DEBUG'),
                    React.createElement('div', { style: { position: 'absolute', top: 20, left: 20, color: '#00ffcc', fontFamily: 'monospace', fontSize: '20px' } }, \`SCORE: \${score}\`),
                    React.createElement('div', { style: { position: 'absolute', left: 50, top: y, width: 30, height: 30, background: '#ff0055', boxShadow: '0 0 20px #ff0055', borderRadius: '4px' } }),
                    React.createElement('div', { style: { position: 'absolute', left: obs.x, bottom: 0, width: 40, height: obs.h, background: '#00ccff', boxShadow: '0 0 15px #00ccff', borderRadius: '4px' } }),
                    gameOver && React.createElement('div', { 
                        style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 } 
                    }, [
                        React.createElement('h2', { style: { fontSize: '32px', marginBottom: '10px' } }, 'GAME OVER'),
                        React.createElement('p', {}, 'Click to Restart')
                    ])
                ]);
            }`,
            preview: "Neon Jumper (Fallback)"
        };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are the KikuAI Ultra-Synthesis Engine. Generate a high-fidelity, addictive React arcade game (body only).
                        
                        CRITICAL GAME DESIGN RULES:
                        1. CODE FORMAT: Return a string that defines the game logic. You MUST end with 'return () => { ... }' or simply return the component function.
                        2. LIBRARIES: Use ONLY React.createElement() - NO JSX. 
                           Available globals: React (useState, useEffect, useRef, etc. are already extracted as local variables), LucideIcons, motion.
                        3. JUICINESS: Add screen shake, particle systems (explosions/sparks), and smooth lerp movement. 
                           Aesthetics: Neon colors, glassmorphism, procedural noise/gradients on Canvas.
                        4. SOUND: Use Web Audio API (AudioContext) for retro SFX (jump, score, gameover, hit).
                        5. GAMEPLAY: Implement meaningful mechanics (difficulty curves, waves, distinct states).
                        
                        EXAMPLE STRUCTURE:
                        const playSfx = (f) => { ... };
                        return () => {
                           const [score, setScore] = useState(0);
                           return React.createElement('div', { style: { ... } }, 'Score: ' + score);
                        };
                        
                        OUTPUT: A JSON object with "code" (string) and "preview" (string).`
                    },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
            }),
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content;
    } catch (error) {
        console.error('[OpenAI] Error generating game code:', error);
        return { code: '() => React.createElement("div", {}, "Error generating game")', preview: 'Error' };
    }
}
