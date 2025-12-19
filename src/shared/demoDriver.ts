import { handleListTemplates } from '../server/tools/listTemplates';
import { handleStartRun } from '../server/tools/startRun';
import { handleAct } from '../server/tools/act';
import { handleEndRun } from '../server/tools/endRun';
import { handleExportChallenge } from '../server/tools/exportChallenge';
import { initTemplates } from '../server/engine/TemplateManager';
import type { OpenAIWidgetAPI, WidgetState, ToolResult } from '../widgets/types';

/**
 * DemoDriver
 * Simulates the window.openai object for the browser demo.
 * Directly calls the tool handlers which interact with the GameEngine.
 */
export class DemoDriver implements OpenAIWidgetAPI {
    public widgetState: WidgetState = {};

    async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
        console.log(`[DemoDriver] Tool Call: ${name}`, args);

        // Artificial delay for "premium" feel and feedback
        await new Promise(resolve => setTimeout(resolve, 600));

        try {
            let result;
            switch (name) {
                case 'list_templates':
                    result = handleListTemplates(args);
                    break;
                case 'start_run':
                    result = handleStartRun(args);
                    break;
                case 'act':
                    result = handleAct(args);
                    break;
                case 'end_run':
                    result = handleEndRun(args);
                    break;
                case 'export_challenge':
                    result = handleExportChallenge(args);
                    break;
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }

            return result as ToolResult;
        } catch (error) {
            console.error(`[DemoDriver] Error:`, error);
            throw error;
        }
    }

    async setWidgetState(state: Partial<WidgetState>): Promise<void> {
        console.log(`[DemoDriver] SetWidgetState:`, state);
        this.widgetState = { ...this.widgetState, ...state };
    }
}

export const demoDriver = new DemoDriver();

// Attach to window if not already there (for widgets to find it)
if (typeof window !== 'undefined') {
    window.openai = demoDriver;
}
