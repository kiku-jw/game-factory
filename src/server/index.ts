#!/usr/bin/env node

// Game Factory - MCP Server Entry Point
// ChatGPT Store App for AI-native endless game generation

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { startRunToolDefinition, handleStartRun } from './tools/startRun.js';
import { actToolDefinition, handleAct } from './tools/act.js';

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
// TOOL DEFINITIONS
// =============================================================================

const tools = [
  startRunToolDefinition,
  actToolDefinition,
  // TODO: Add more tools in Phase 1
  // listTemplatesToolDefinition,
  // endRunToolDefinition,
  // exportChallengeToolDefinition,
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
      case 'start_run': {
        const result = handleStartRun(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.structuredContent),
            },
          ],
          _meta: result._meta,
        };
      }

      case 'act': {
        const result = handleAct(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.structuredContent),
            },
          ],
          _meta: result._meta,
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Game Factory] Error: ${message}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: message }),
        },
      ],
      isError: true,
    };
  }
});

// =============================================================================
// STARTUP
// =============================================================================

async function main() {
  console.error('[Game Factory] Starting MCP server...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Game Factory] Server running. Waiting for requests...');
}

main().catch((error) => {
  console.error('[Game Factory] Fatal error:', error);
  process.exit(1);
});
