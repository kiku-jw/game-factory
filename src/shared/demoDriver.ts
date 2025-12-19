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

    constructor(onStateChange?: (state: WidgetState) => void) {
        this.onStateChange = onStateChange;
    }

    async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
        console.log(`[DemoDriver] Tool Call: ${name}`, args);
        await initTemplates();
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            let result: any;
            if (name === 'start_run' && args.prompt) {
                const synthesized = await generateGameCode(args.prompt as string);
                console.log('[DemoDriver] Generated Code:', synthesized);

                const sc = {
                    outcome: 'arcade_active',
                    code: synthesized.code,
                    preview: synthesized.preview
                };

                const newState: Partial<WidgetState> = {
                    view: 'ArcadeCard' as any, // We will repurpose this view or add code-gen view
                    arcade: {
                        code: synthesized.code,
                        genre: synthesized.preview,
                        difficulty: 'Vibe',
                        hp: 100,
                        runRef: 'vibe-' + Date.now()
                    }
                };

                await this.setWidgetState(newState);
                return { structuredContent: sc, _meta: { runRef: 'vibe-' + Date.now() } } as any;
            }

            switch (name) {
                case 'list_templates': result = handleListTemplates(args); break;
                case 'start_run': result = handleStartRun(args); break;
                case 'act': result = handleAct(args); break;
                case 'end_run': result = handleEndRun(args); break;
                case 'export_challenge': result = handleExportChallenge(args); break;
                default: throw new Error(`Unknown tool: ${name}`);
            }

            // Automap outcomes to views for the demo
            if (result.structuredContent) {
                const sc = result.structuredContent;
                const view = this.mapOutcomeToView();

                const newState: Partial<WidgetState> = {
                    view: 'ArcadeCard',
                    arcade: {
                        genre: result._meta.worldName || 'Fantasy',
                        difficulty: 'Normal',
                        hp: sc.hp || 10,
                        runRef: result._meta.runRef
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

    private mapOutcomeToView(): string {
        return 'ArcadeCard';
    }

    async setWidgetState(state: Partial<WidgetState>): Promise<void> {
        this.widgetState = { ...this.widgetState, ...state };
        if (this.onStateChange) this.onStateChange(this.widgetState);
    }
}
