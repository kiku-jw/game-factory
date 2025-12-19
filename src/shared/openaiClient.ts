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
    if (!apiKey) {
        console.warn('[OpenAI] No API key, using fallback code.');
        return {
            code: `() => {
                const [pos, setPos] = React.useState(0);
                React.useEffect(() => {
                    const id = setInterval(() => setPos(p => (p + 2) % 100), 20);
                    return () => clearInterval(id);
                }, []);
                return React.createElement('div', { 
                    style: { 
                        width: 50, 
                        height: 50, 
                        background: 'radial-gradient(circle, #ff0055, #8800ff)', 
                        borderRadius: '12px',
                        boxShadow: '0 0 20px rgba(255,0,85,0.5)',
                        transform: \`translateX(\${pos}px) rotate(\${pos}deg)\` 
                    } 
                });
            }`,
            preview: "Fallback Engine"
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
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a Vibe-Coding Game Engine. Generate a self-contained React functional component body.
                        
                        CRITICAL RULES:
                        1. Use ONLY React.createElement() - NO JSX (no <tags>). 
                           Example: React.createElement('div', { style: { color: 'white' } }, 'Hello')
                        2. Use standard HTML5 Canvas or DOM elements for the game.
                        3. Use 'React.useState', 'React.useEffect', etc. (React and Lucide are available).
                        4. Include a full game loop, keyboard controls (Arrows/Space), Score, and Game Over.
                        5. Use high-fidelity styles (gradients, shadows, animations).
                        6. Return ONLY a JSON object:
                           "code": A string containing a function expression that returns React elements.
                           "preview": A short title.
                        
                        Example "code":
                        "() => {
                          const [score, setScore] = React.useState(0);
                          return React.createElement('div', { style: { background: 'black' } }, \`Score: \${score}\`);
                        }"`
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
        return { code: '() => <div>Error generating game</div>', preview: 'Error' };
    }
}
