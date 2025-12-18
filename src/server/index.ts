#!/usr/bin/env node

// Game Factory - MCP Server Entry Point
// ChatGPT Store App for AI-native endless game generation

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[Game Factory] Tool called: ${name}`);

  try {
    switch (name) {
      case 'list_templates': {
        const result = handleListTemplates(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
          _meta: result._meta,
        };
      }

      case 'start_run': {
        const result = handleStartRun(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
          _meta: result._meta,
        };
      }

      case 'act': {
        const result = handleAct(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
          _meta: result._meta,
        };
      }

      case 'end_run': {
        const result = handleEndRun(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
          _meta: result._meta,
        };
      }

      case 'export_challenge': {
        const result = handleExportChallenge(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Game Factory] Error: ${message}`);

    return {
      content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
      isError: true,
    };
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
