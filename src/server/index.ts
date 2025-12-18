#!/usr/bin/env node

// Game Factory - MCP Server Entry Point
// ChatGPT Store App for AI-native endless game generation

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

import { initTemplates } from './engine/TemplateManager.js';
import { listTemplatesToolDefinition, handleListTemplates } from './tools/listTemplates.js';
import { startRunToolDefinition, handleStartRun } from './tools/startRun.js';
import { actToolDefinition, handleAct } from './tools/act.js';
import { endRunToolDefinition, handleEndRun } from './tools/endRun.js';
import { exportChallengeToolDefinition, handleExportChallenge } from './tools/exportChallenge.js';

// =============================================================================
// SERVER SETUP
// =============================================================================

const server = new Server(
  {
    name: 'game-factory',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// =============================================================================
// TOOL DEFINITIONS (5 Core Tools)
// =============================================================================

const tools = [
  listTemplatesToolDefinition,
  startRunToolDefinition,
  actToolDefinition,
  endRunToolDefinition,
  exportChallengeToolDefinition,
];

// =============================================================================
// HELPERS
// =============================================================================

function createToolResult(
  structuredContent: unknown,
  meta?: unknown
): CallToolResult {
  const result: CallToolResult = {
    content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
  };

  // Add _meta for widget rendering (OpenAI Apps SDK specific)
  if (meta !== undefined) {
    (result as Record<string, unknown>)['_meta'] = meta;
  }

  return result;
}

function createErrorResult(message: string): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

// =============================================================================
// HANDLERS
// =============================================================================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  console.error(`[Game Factory] Tool called: ${name}`);

  try {
    switch (name) {
      case 'list_templates': {
        const result = handleListTemplates(args);
        return createToolResult(result.structuredContent, result._meta);
      }

      case 'start_run': {
        const result = handleStartRun(args);
        return createToolResult(result.structuredContent, result._meta);
      }

      case 'act': {
        const result = handleAct(args);
        return createToolResult(result.structuredContent, result._meta);
      }

      case 'end_run': {
        const result = handleEndRun(args);
        return createToolResult(result.structuredContent, result._meta);
      }

      case 'export_challenge': {
        const result = handleExportChallenge(args);
        return createToolResult(result.structuredContent);
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Game Factory] Error: ${message}`);
    return createErrorResult(message);
  }
});

// =============================================================================
// STARTUP
// =============================================================================

async function main() {
  console.error('[Game Factory] Starting MCP server...');

  // Initialize templates
  initTemplates();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Game Factory] Server running with 5 tools. Waiting for requests...');
}

main().catch((error) => {
  console.error('[Game Factory] Fatal error:', error);
  process.exit(1);
});
