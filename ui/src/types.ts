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

export interface GraphNode {
  id: number;
  label: string;
  tags: string[];
  created_at: string;
}

export interface GraphEdge {
  source: number;
  target: number;
  weight: number;
}

export interface GraphPosition {
  x: number;
  y: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Record<string, GraphPosition>;
}

export interface StatusResult {
  entries: number;
  latest_id: number | null;
  latest_at: string | null;
  ollama: boolean;
}

export type WritePhase = 'idle' | 'logging' | 'tagging' | 'embedding';

export type WriteStatus =
  | { phase: 'idle' }
  | { phase: Exclude<WritePhase, 'idle'>; elapsed?: number; embedding?: number[]; tokens?: number }
  | { phase: 'done'; id: number; tags: string[]; elapsed?: number; tokens?: number }
  | { phase: 'error'; message: string };
