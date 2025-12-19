import { handleListTemplates } from '../server/tools/listTemplates';
import { handleStartRun } from '../server/tools/startRun';
import { handleAct } from '../server/tools/act';
import { handleEndRun } from '../server/tools/endRun';
import { handleExportChallenge } from '../server/tools/exportChallenge';
import { initTemplates } from '../server/engine/TemplateManager';
import { synthesizeGameSettings } from './openaiClient';
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
                const synthesized = await synthesizeGameSettings(args.prompt as string);
                console.log('[DemoDriver] Synthesized:', synthesized);
                args = { ...args, ...synthesized };
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
                const view = this.mapOutcomeToView(sc.outcome, name, result._meta);

                const newState: Partial<WidgetState> = {
                    view: view as any,
                };

                if (view === 'SceneCard') newState.scene = { ...sc, ...result._meta };
                if (view === 'ConsequenceCard') newState.consequence = { ...sc, ...result._meta };
                if (view === 'EndRunCard') newState.runSummary = { ...sc, ...result._meta };
                if (view === 'ArcadeCard') newState.arcade = {
                    genre: result._meta.worldName || 'Fantasy',
                    difficulty: 'Normal',
                    hp: sc.hp,
                    runRef: result._meta.runRef
                };

                await this.setWidgetState(newState);
            }

            return result as ToolResult;
        } catch (error) {
            console.error(`[DemoDriver] Error:`, error);
            throw error;
        }
    }

    private mapOutcomeToView(outcome: string, tool: string, meta?: any): string {
        if (meta?.['openai/outputTemplate']) return meta['openai/outputTemplate'];
        if (tool === 'start_run') return 'SceneCard';
        if (outcome === 'pending_consequence') return 'ConsequenceCard';
        if (outcome === 'run_ended') return 'EndRunCard';
        return 'SceneCard';
    }

    async setWidgetState(state: Partial<WidgetState>): Promise<void> {
        this.widgetState = { ...this.widgetState, ...state };
        if (this.onStateChange) this.onStateChange(this.widgetState);
    }
}
