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
}

export interface ToolResult {
  structuredContent: unknown;
  _meta?: Record<string, unknown>;
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
