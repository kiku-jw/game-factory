// Game Factory Widget Types

// OpenAI window interface
declare global {
  interface Window {
    openai: OpenAIWidgetAPI;
  }
}

export interface OpenAIWidgetAPI {
  callTool: (name: string, args: Record<string, unknown>) => Promise<ToolResult>;
  widgetState: WidgetState;
  setWidgetState: (state: Partial<WidgetState>) => Promise<void>;
}

export interface WidgetState {
  runRef?: string;
  selectedGenre?: string;
  selectedTone?: string;
  selectedLength?: string;
  selectedDifficulty?: string;
  lastKnownTurn?: number;
  view?: 'WelcomeCard' | 'SceneCard' | 'ConsequenceCard' | 'EndRunCard';

  // Scene Data
  scene?: {
    turn: number;
    hp: number;
    supplies: number;
    threat: 'low' | 'medium' | 'high';
    invCount: number;
    choices: ChoiceDisplay[];
    runRef: string;
    narrative: string;
    chapterTitle: string;
  };

  // Consequence Data
  consequence?: {
    turn: number;
    consequences: ConsequenceDisplay[];
    runRef: string;
    failureNarrative: string;
  };

  // Run Summary Data
  runSummary?: {
    turnsSurvived: number;
    itemsFound: number;
    threatsDefeated: number;
    progressReached: number;
    rating: RatingDisplay;
    seed: string;
    endingNarrative: string;
    itemsList: string[];
    shareText: string;
  };
}

export interface ToolResult {
  structuredContent: any;
  _meta?: Record<string, any>;
}

// Choice display
export interface ChoiceDisplay {
  id: string;
  label: string;
  risk: number | null;
  cost: string | null;
}

// Consequence display
export interface ConsequenceDisplay {
  id: string;
  label: string;
}

// Template display
export interface TemplateDisplay {
  id: string;
  name: string;
  description: string;
  genre: string;
  difficulty: string;
  featured: boolean;
  tags: string[];
  atmosphere: string;
}

// Rating display
export interface RatingDisplay {
  stars: number;
  title: string;
}
