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
    console.log('[generateGameCode] Prompt:', prompt, 'hasApiKey:', !!apiKey);
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
                                // Simple collision check (ignoring gap for now, just height based)
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
                        content: `You are the KikuAI Synthesis Engine. Generate a self-contained React functional component (body only).
                        
                        CRITICAL CONSTRAINTS:
                        1. USE ONLY React.createElement() - NO JSX tags.
                        2. The game MUST be playable (use window/document listeners for keyboard OR onClick for mouse).
                        3. Use high-fidelity aesthetics: gradients, rounded corners, box-shadows, glow effects.
                        4. Include state for: score, gameOver, player position, obstacles/enemies.
                        5. Use smooth physics (delta time or fixed interval).
                        6. Ensure it fits in a 500x500 container.
                        
                        Available Libraries: React, Lucide (via Lucide.IconName), motion (via motion.div).
                        
                        Output Format: JSON with "code" (string) and "preview" (string).
                        Example "code": "() => { ... implementation ... }"`
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
