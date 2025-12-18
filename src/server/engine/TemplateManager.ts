// Game Factory - Template Manager
// Loads and manages curated game templates

import type { GameTemplate, Genre, Scene, Choice } from '../types/index.js';

// =============================================================================
// TEMPLATE STORAGE
// =============================================================================

const templates: Map<string, GameTemplate> = new Map();

// =============================================================================
// BUILT-IN TEMPLATES
// =============================================================================

const BUILT_IN_TEMPLATES: GameTemplate[] = [
  // FANTASY
  {
    id: 'fantasy-crystal-caves',
    name: 'Crystal Caves',
    description: 'Explore ancient caverns filled with magical crystals and forgotten secrets.',
    genre: 'fantasy',
    difficulty: 'normal',
    featured: true,
    world: {
      setting: 'A vast underground network of caves beneath an ancient mountain',
      era: 'Age of Legends',
      atmosphere: 'Mysterious, wondrous, slightly dangerous',
      tags: ['caves', 'magic', 'crystals', 'exploration'],
    },
    mechanics: {
      resourcePressure: 'medium',
      threatEscalation: 'medium',
      puzzleFrequency: 'medium',
      npcInteraction: 'low',
    },
    safety: {
      maxViolenceLevel: 1,
      forbiddenThemes: ['occult', 'gore', 'romance'],
      deathStyle: 'fade',
    },
    initialScene: {
      chapterId: 1,
      title: 'The Cave Mouth',
      narrative: 'The entrance to the Crystal Caves looms before you, a natural archway in the mountainside. Faint purple light pulses from within, and you can hear the distant sound of dripping water. Your torch flickers in the cool breeze emanating from the depths. Local legends speak of treasures within, but also of those who never returned.',
      choices: [
        { id: 'c1', label: 'Enter cautiously with torch raised', risk: null, cost: null },
        { id: 'c2', label: 'Search the entrance for clues', risk: null, cost: { type: 'turn', amount: 1 } },
        { id: 'c3', label: 'Call out to see if anyone is inside', risk: 70, cost: null },
      ],
    },
    encounters: {
      threats: ['cave-in', 'crystal-guardian', 'pit-trap', 'flooding'],
      discoveries: ['glowing-crystal', 'ancient-map', 'healing-spring', 'hidden-cache'],
      puzzles: ['crystal-alignment', 'bridge-riddle', 'echo-puzzle'],
    },
  },

  // SCI-FI
  {
    id: 'scifi-abandoned-station',
    name: 'Abandoned Station',
    description: 'Wake up alone on a derelict space station. Something went wrong.',
    genre: 'sci-fi',
    difficulty: 'normal',
    featured: true,
    world: {
      setting: 'Research Station Artemis, orbiting Neptune',
      era: '2347 AD',
      atmosphere: 'Tense, isolated, mysterious',
      tags: ['space', 'survival', 'mystery', 'isolation'],
    },
    mechanics: {
      resourcePressure: 'high',
      threatEscalation: 'medium',
      puzzleFrequency: 'low',
      npcInteraction: 'none',
    },
    safety: {
      maxViolenceLevel: 2,
      forbiddenThemes: ['occult', 'gore'],
      deathStyle: 'fade',
    },
    initialScene: {
      chapterId: 1,
      title: 'Emergency Wake',
      narrative: 'Emergency lights pulse red as you emerge from cryo-sleep. The station is silent except for the hum of failing life support. Your heads-up display flickers, showing critical system alerts. Through the frost on your pod, you see the med-bay is empty. The last thing you remember is the routine journey to Neptune. Now, something is very wrong.',
      choices: [
        { id: 'c1', label: 'Check the nearby terminal for status', risk: null, cost: null },
        { id: 'c2', label: 'Search med-bay for supplies', risk: null, cost: null },
        { id: 'c3', label: 'Try to access the main corridor', risk: 70, cost: null },
      ],
    },
    encounters: {
      threats: ['hull-breach', 'system-failure', 'quarantine-lockdown', 'oxygen-depletion'],
      discoveries: ['crew-log', 'emergency-kit', 'access-card', 'escape-pod-location'],
      puzzles: ['door-override', 'power-reroute', 'communication-repair'],
    },
  },

  // MYSTERY
  {
    id: 'mystery-thornwood-manor',
    name: 'Thornwood Manor',
    description: 'Investigate the disappearance at an old manor with dark secrets.',
    genre: 'mystery',
    difficulty: 'normal',
    featured: true,
    world: {
      setting: 'A Victorian-era manor house in the English countryside',
      era: '1890s',
      atmosphere: 'Suspenseful, intriguing, gothic',
      tags: ['detective', 'manor', 'secrets', 'investigation'],
    },
    mechanics: {
      resourcePressure: 'low',
      threatEscalation: 'low',
      puzzleFrequency: 'medium',
      npcInteraction: 'medium',
    },
    safety: {
      maxViolenceLevel: 1,
      forbiddenThemes: ['occult', 'gore', 'romance'],
      deathStyle: 'reset',
    },
    initialScene: {
      chapterId: 1,
      title: 'The Study',
      narrative: 'The old manor study is exactly as described in the letter. Dusty bookshelves line the walls, and a large mahogany desk dominates the center. Papers are scattered as if someone left in a hurry. The grandfather clock has stopped at midnight. You are here to find what happened to Lord Thornwood, who vanished three nights ago.',
      choices: [
        { id: 'c1', label: 'Examine the scattered papers', risk: null, cost: null },
        { id: 'c2', label: 'Check behind the bookshelf', risk: 70, cost: null },
        { id: 'c3', label: 'Investigate the stopped clock', risk: null, cost: null },
      ],
    },
    encounters: {
      threats: ['suspicious-servant', 'locked-room', 'false-lead', 'time-pressure'],
      discoveries: ['hidden-letter', 'secret-passage', 'witness-testimony', 'key-evidence'],
      puzzles: ['cipher-decode', 'timeline-reconstruction', 'alibi-verification'],
    },
  },

  // HORROR-LITE
  {
    id: 'horror-forsaken-cabin',
    name: 'The Forsaken Cabin',
    description: 'Shelter from a storm in an abandoned cabin. You are not alone.',
    genre: 'horror-lite',
    difficulty: 'hard',
    featured: true,
    world: {
      setting: 'A remote cabin in the pine forests of the Pacific Northwest',
      era: 'Present day',
      atmosphere: 'Unsettling, tense, mysterious',
      tags: ['survival', 'isolation', 'suspense', 'forest'],
    },
    mechanics: {
      resourcePressure: 'high',
      threatEscalation: 'high',
      puzzleFrequency: 'low',
      npcInteraction: 'none',
    },
    safety: {
      maxViolenceLevel: 2,
      forbiddenThemes: ['occult', 'gore', 'graphic-death'],
      deathStyle: 'fade',
    },
    initialScene: {
      chapterId: 1,
      title: 'Shelter',
      narrative: 'The cabin looked abandoned from outside, but inside shows signs of recent occupation. A fire still smolders in the hearth. Through the grimy window, fog rolls through the trees as the storm intensifies. Your car broke down a mile back, and this was the only shelter. Then you hear it from the basement - a rhythmic sound, like breathing.',
      choices: [
        { id: 'c1', label: 'Investigate the basement carefully', risk: 60, cost: null },
        { id: 'c2', label: 'Search the main floor first', risk: null, cost: null },
        { id: 'c3', label: 'Barricade the basement door', risk: null, cost: { type: 'supplies', amount: 1 } },
      ],
    },
    encounters: {
      threats: ['strange-noise', 'power-outage', 'window-shadow', 'door-rattling'],
      discoveries: ['flashlight', 'journal-entry', 'radio', 'car-keys'],
      puzzles: ['generator-repair', 'locked-safe', 'escape-route'],
    },
  },

  // FANTASY - Additional
  {
    id: 'fantasy-dragon-keep',
    name: 'Dragon Keep',
    description: 'Infiltrate the fortress of an ancient dragon to retrieve a stolen artifact.',
    genre: 'fantasy',
    difficulty: 'hard',
    featured: false,
    world: {
      setting: 'A volcanic mountain fortress occupied by a dragon',
      era: 'Age of Dragons',
      atmosphere: 'Dangerous, epic, treasure-filled',
      tags: ['dragon', 'heist', 'treasure', 'stealth'],
    },
    mechanics: {
      resourcePressure: 'high',
      threatEscalation: 'high',
      puzzleFrequency: 'low',
      npcInteraction: 'low',
    },
    safety: {
      maxViolenceLevel: 2,
      forbiddenThemes: ['occult', 'gore'],
      deathStyle: 'fade',
    },
    initialScene: {
      chapterId: 1,
      title: 'The Approach',
      narrative: 'The volcanic peak looms above, smoke curling from its crater. The dragon\'s keep is carved into the mountainside, ancient and imposing. You can see the main gate far above, guarded by creatures in the dragon\'s service. But local rumors speak of hidden passages. The artifact your village needs to survive lies within.',
      choices: [
        { id: 'c1', label: 'Search for a hidden entrance', risk: null, cost: { type: 'turn', amount: 1 } },
        { id: 'c2', label: 'Observe the guard patterns', risk: null, cost: null },
        { id: 'c3', label: 'Attempt to climb the cliffs', risk: 60, cost: null },
      ],
    },
    encounters: {
      threats: ['guard-patrol', 'trap-floor', 'dragon-shadow', 'lava-flow'],
      discoveries: ['treasure-room', 'secret-tunnel', 'sleeping-guard', 'artifact-location'],
      puzzles: ['lock-mechanism', 'pressure-plates', 'distraction-puzzle'],
    },
  },
];

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Initialize templates on startup
 */
export function initTemplates(): void {
  for (const template of BUILT_IN_TEMPLATES) {
    templates.set(template.id, template);
  }
  console.error(`[TemplateManager] Loaded ${templates.size} templates`);
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
  return all[Math.floor(Math.random() * all.length)];
}
