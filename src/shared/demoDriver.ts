import { handleListTemplates } from '../server/tools/listTemplates';
import { handleStartRun } from '../server/tools/startRun';
import { handleAct } from '../server/tools/act';
import { handleEndRun } from '../server/tools/endRun';
import { handleExportChallenge } from '../server/tools/exportChallenge';
import { initTemplates } from '../server/engine/TemplateManager';
import { generateGameCode } from './openaiClient';
import type { OpenAIWidgetAPI, WidgetState, ToolResult } from '../widgets/types';

export class DemoDriver implements OpenAIWidgetAPI {
    public widgetState: WidgetState = {};
    private onStateChange?: (state: WidgetState) => void;
    private provider: 'openai' | 'openrouter' = 'openai';
    private apiKey = '';
    private openRouterModel?: string;

    constructor(onStateChange?: (state: WidgetState) => void) {
        this.onStateChange = onStateChange;
    }

    setCredentials(provider: 'openai' | 'openrouter', apiKey: string, openRouterModel?: string) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.openRouterModel = openRouterModel;
    }

    async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
        console.log(`[DemoDriver] Tool Call: ${name}`, args);
        await initTemplates();
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (name === 'start_run' && args.prompt) {
                if (!this.apiKey) {
                    throw new Error('Please provide an API key to start a run.');
                }

                console.log('[DemoDriver] Code-gen path triggered for prompt:', args.prompt);
                const synthesized = await generateGameCode(args.prompt as string, {
                    provider: this.provider,
                    apiKey: this.apiKey,
                    openRouterModel: this.openRouterModel,
                });
                console.log('[DemoDriver] Synthesis result:', synthesized.preview);

                const sc = {
                    outcome: 'arcade_active',
                    code: synthesized.code,
                    preview: synthesized.preview
                };

                const newState: Partial<WidgetState> = {
                    view: 'ArcadeCard',
                    arcade: {
                        code: synthesized.code,
                        genre: synthesized.preview,
                        difficulty: 'Vibe',
                        hp: 100,
                        runRef: 'vibe-' + Date.now()
                    }
                };

                console.log('[DemoDriver] Setting state with code length:', synthesized.code.length);
                await this.setWidgetState(newState);
                return { structuredContent: sc, _meta: { runRef: 'vibe-' + Date.now() } };
            }

            let result: ToolResult;

            switch (name) {
                case 'list_templates': result = handleListTemplates(args) as unknown as ToolResult; break;
                case 'start_run': result = handleStartRun(args) as unknown as ToolResult; break;
                case 'act': result = handleAct(args) as unknown as ToolResult; break;
                case 'end_run': result = handleEndRun(args) as unknown as ToolResult; break;
                case 'export_challenge': result = handleExportChallenge(args) as unknown as ToolResult; break;
                default: throw new Error(`Unknown tool: ${name}`);
            }

            // Automap outcomes to views for the demo
            if (result.structuredContent) {
                const sc = result.structuredContent as { hp?: number };
                const meta = result._meta as { worldName?: string; runRef?: string } | undefined;

                const newState: Partial<WidgetState> = {
                    view: 'ArcadeCard',
                    arcade: {
                        genre: meta?.worldName || 'Fantasy',
                        difficulty: 'Normal',
                        hp: sc.hp || 10,
                        runRef: meta?.runRef || ''
                    }
                };

                await this.setWidgetState(newState);
            }

            return result as ToolResult;
        } catch (error) {
            console.error(`[DemoDriver] Error:`, error);
            throw error;
        }
    }

    async setWidgetState(state: Partial<WidgetState>): Promise<void> {
        this.widgetState = { ...this.widgetState, ...state };
        if (this.onStateChange) this.onStateChange(this.widgetState);
    }
}
