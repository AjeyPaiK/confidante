export type Mode = 'write' | 'search' | 'log' | 'themes' | 'timeline';

export interface ThoughtRow {
  id: number;
  body: string;
  tags: string[];
  created_at: string;
}

export interface SearchResult extends ThoughtRow {
  score: number;
}

export type TagCounts = Record<string, number>;
export type TimelineCounts = Record<string, number>;

export interface StatusResult {
  entries: number;
  latest_id: number | null;
  latest_at: string | null;
  ollama: boolean;
}

export type WritePhase = 'idle' | 'logging' | 'tagging' | 'embedding';

export type WriteStatus =
  | { phase: 'idle' }
  | { phase: WritePhase }
  | { phase: 'done'; id: number; tags: string[] }
  | { phase: 'error'; message: string };
