import type { GameTemplate, Genre } from '../types/index.js';

// =============================================================================
// TEMPLATE STORAGE
// =============================================================================

const templates: Map<string, GameTemplate> = new Map();

// =============================================================================
// BROWSER / SERVER DETECTION
// =============================================================================

const isBrowser = typeof window !== 'undefined';

/**
 * Initialize templates on startup
 */
export async function initTemplates(): Promise<void> {
  templates.clear();

  if (isBrowser) {
    // In Browser: Use Vite's glob import
    const globTemplates = import.meta.glob('../../../templates/**/*.json', { eager: true });
    for (const path in globTemplates) {
      const template = (globTemplates[path] as any).default as GameTemplate;
      if (template && template.id) {
        templates.set(template.id, template);
      }
    }
  } else {
    // In Node: Use fs (dynamic import to avoid bundling errors in browser)
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const TEMPLATES_ROOT = path.resolve(__dirname, '../../../templates');

    if (!fs.existsSync(TEMPLATES_ROOT)) return;

    const findJsonFiles = (dir: string): string[] => {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          results.push(...findJsonFiles(fullPath));
        } else if (file.endsWith('.json')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const jsonFiles = findJsonFiles(TEMPLATES_ROOT);
    for (const filePath of jsonFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const template = JSON.parse(content) as GameTemplate;
      if (template.id) templates.set(template.id, template);
    }
  }
}

/**
 * Load all templates
 */
export function loadTemplates(): GameTemplate[] {
  return Array.from(templates.values());
}

/**
 * Get a specific template by ID
 */
export function getTemplate(id: string): GameTemplate | null {
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
    throw new Error('No templates available. Did you call initTemplates?');
  }
  return all[Math.floor(Math.random() * all.length)];
}
