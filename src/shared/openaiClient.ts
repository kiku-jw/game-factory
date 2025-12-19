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

export async function synthesizeGameSettings(prompt: string): Promise<any> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.warn('[OpenAI] No API key, using fallback synthesis.');
        return { genre: 'fantasy', format: 'quest', difficulty: 'normal' };
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
                        content: `You are a Game Factory Architect. Translate the user prompt into structured game configuration.
                        Return ONLY JSON in this format:
                        {
                          "genre": "fantasy" | "sci-fi" | "mystery" | "horror-lite" | "cyberpunk" | "surreal",
                          "format": "quest" | "arcade" | "puzzle",
                          "difficulty": "easy" | "normal" | "hard",
                          "tone": "serious" | "light",
                          "suggestedNarrative": "A short 1-sentence hook"
                        }`
                    },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
            }),
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('[OpenAI] Error synthesizing settings:', error);
        return { genre: 'fantasy', format: 'quest', difficulty: 'normal' };
    }
}
