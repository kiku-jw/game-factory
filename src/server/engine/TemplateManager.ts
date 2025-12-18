// Game Factory - Template Manager
// Loads and manages curated game templates

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GameTemplate, Genre } from '../types/index.js';

// =============================================================================
// PATH HELPERS
// =============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_ROOT = path.resolve(__dirname, '../../../templates');

// =============================================================================
// TEMPLATE STORAGE
// =============================================================================

const templates: Map<string, GameTemplate> = new Map();

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Recursively find all .json files in a directory
 */
function findJsonFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (file.endsWith('.json')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Initialize templates on startup
 */
export function initTemplates(): void {
  templates.clear();

  if (!fs.existsSync(TEMPLATES_ROOT)) {
    console.error(`[TemplateManager] Templates root not found: ${TEMPLATES_ROOT}`);
    return;
  }

  const jsonFiles = findJsonFiles(TEMPLATES_ROOT);

  for (const filePath of jsonFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const template = JSON.parse(content) as GameTemplate;

      if (template.id) {
        templates.set(template.id, template);
      }
    } catch (error) {
      console.error(`[TemplateManager] Failed to load template from ${filePath}:`, error);
    }
  }

  console.error(`[TemplateManager] Loaded ${templates.size} templates from ${TEMPLATES_ROOT}`);
}

/**
 * Load all templates
 */
export function loadTemplates(): GameTemplate[] {
  if (templates.size === 0) {
    initTemplates();
  }
  return Array.from(templates.values());
}

/**
 * Get a specific template by ID
 */
export function getTemplate(id: string): GameTemplate | null {
  if (templates.size === 0) {
    initTemplates();
  }
  return templates.get(id) ?? null;
}

/**
 * Get templates by genre
 */
export function getTemplatesByGenre(genre: Genre): GameTemplate[] {
  return loadTemplates().filter(t => t.genre === genre);
}

/**
 * Get featured templates
 */
export function getFeaturedTemplates(): GameTemplate[] {
  return loadTemplates().filter(t => t.featured);
}

/**
 * Get a random template
 */
export function getRandomTemplate(): GameTemplate {
  const all = loadTemplates();
  if (all.length === 0) {
    throw new Error('No templates available');
  }
  return all[Math.floor(Math.random() * all.length)];
}

