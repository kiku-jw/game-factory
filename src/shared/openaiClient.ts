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
                const [pos, setPos] = React.useState(50);
                React.useEffect(() => {
                    const id = setInterval(() => setPos(p => (p + 2) % 400), 20);
                    return () => clearInterval(id);
                }, []);
                return <div style={{width: 50, height: 50, background: 'red', transform: \`translateX(\${pos}px)\` }} />;
            }`,
            preview: "Fallback Game Engine"
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
                        content: `You are a Vibe-Coding Game Engine. Generate a self-contained React functional component for an arcade game based on the user's prompt.
                        
                        RULES:
                        1. Use ONLY React and standard HTML5 Canvas/DOM. No external libraries besides 'lucide-react'.
                        2. Use 'React.useState', 'React.useEffect', etc. (React is available globally).
                        3. The game must be playable with keyboard (Arrows/Space).
                        4. Include a 'Game Over' and 'Score' state.
                        5. The component should be visually polished with CSS-in-JS or inline styles.
                        6. Return ONLY a JSON object with two fields: 
                           "code": A string containing the body of the function (excluding 'export default'). It should be a function expression that returns JSX.
                           "preview": A short 3-word title of the game.
                        
                        Example "code" format:
                        () => {
                          const [score, setScore] = React.useState(0);
                          // ... game logic ...
                          return <div style={{ background: 'black', color: 'white' }}>Score: {score}</div>
                        }`
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
