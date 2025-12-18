// Game Factory - list_templates Tool Handler

import { z } from 'zod';
import { loadTemplates, getTemplate } from '../engine/TemplateManager.js';
import type { ListTemplatesInput, ListTemplatesOutput, TemplateInfo, Genre } from '../types/index.js';

// =============================================================================
// INPUT SCHEMA
// =============================================================================

export const ListTemplatesInputSchema = z.object({
  genre: z.enum(['fantasy', 'sci-fi', 'mystery', 'horror-lite']).optional(),
  featured: z.boolean().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

// =============================================================================
// TOOL DEFINITION
// =============================================================================

export const listTemplatesToolDefinition = {
  name: 'list_templates',
  description: 'Browse available curated game templates. Returns template summaries for selection.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      genre: {
        type: 'string',
        enum: ['fantasy', 'sci-fi', 'mystery', 'horror-lite'],
        description: 'Filter by genre',
      },
      featured: {
        type: 'boolean',
        description: 'Only show featured/staff-pick templates',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of templates to return (default 20)',
      },
    },
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
  },
};

// =============================================================================
// HANDLER
// =============================================================================

export function handleListTemplates(input: unknown): {
  structuredContent: ListTemplatesOutput;
  _meta: ListTemplatesMeta;
} {
  const parsed = ListTemplatesInputSchema.parse(input);
  const { genre, featured, limit = 20 } = parsed;

  // Load all templates
  let templates = loadTemplates();

  // Filter by genre
  if (genre) {
    templates = templates.filter(t => t.genre === genre);
  }

  // Filter by featured
  if (featured) {
    templates = templates.filter(t => t.featured);
  }

  // Limit results
  const limitedTemplates = templates.slice(0, limit);

  // Format for model (concise)
  const templateInfos: TemplateInfo[] = limitedTemplates.map(t => ({
    id: t.id,
    name: t.name,
    genre: t.genre,
    difficulty: t.difficulty,
  }));

  const structuredContent: ListTemplatesOutput = {
    templates: templateInfos,
    total: templates.length,
  };

  // Rich details for widget
  const _meta: ListTemplatesMeta = {
    'openai/outputTemplate': 'TemplateShelf',
    templateDetails: limitedTemplates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      genre: t.genre,
      difficulty: t.difficulty,
      featured: t.featured,
      tags: t.world.tags,
      atmosphere: t.world.atmosphere,
    })),
  };

  return { structuredContent, _meta };
}

// =============================================================================
// META TYPE
// =============================================================================

interface ListTemplatesMeta {
  'openai/outputTemplate': 'TemplateShelf';
  templateDetails: Array<{
    id: string;
    name: string;
    description: string;
    genre: Genre;
    difficulty: string;
    featured: boolean;
    tags: string[];
    atmosphere: string;
  }>;
}
