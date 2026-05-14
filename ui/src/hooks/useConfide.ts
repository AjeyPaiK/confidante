import { execa } from 'execa';
import { createInterface } from 'readline';
import type {
  ThoughtRow,
  SearchResult,
  TagCounts,
  TimelineCounts,
  StatusResult,
  WriteStatus,
} from '../types';

const CONFIDE_BIN = process.env.CONFIDE_BIN ?? 'confide';

export interface ConfideAPI {
  fetchStatus: () => Promise<StatusResult>;
  fetchLog: (opts?: { limit?: number; since?: string; tag?: string }) => Promise<ThoughtRow[]>;
  fetchSearch: (query: string, opts?: { top?: number }) => Promise<SearchResult[]>;
  fetchThemes: (opts?: { top?: number }) => Promise<TagCounts>;
  fetchTimeline: (opts?: { since?: string }) => Promise<TimelineCounts>;
  writeThought: (text: string, onProgress: (status: WriteStatus) => void) => Promise<void>;
}

export function useConfide(): ConfideAPI {
  async function fetchStatus(): Promise<StatusResult> {
    try {
      const { stdout } = await execa(CONFIDE_BIN, ['status', '--json']);
      return JSON.parse(stdout);
    } catch {
      return { entries: 0, latest_id: null, latest_at: null, ollama: false };
    }
  }

  async function fetchLog(opts = {}): Promise<ThoughtRow[]> {
    try {
      const args = ['log', '--json'];
      if (opts.limit) args.push('--limit', String(opts.limit));
      if (opts.since) args.push('--since', opts.since);
      if (opts.tag) args.push('--tag', opts.tag);
      const { stdout } = await execa(CONFIDE_BIN, args);
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  async function fetchSearch(query: string, opts = {}): Promise<SearchResult[]> {
    try {
      const args = ['search', query, '--json'];
      if (opts.top) args.push('--top', String(opts.top));
      const { stdout } = await execa(CONFIDE_BIN, args);
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  async function fetchThemes(opts = {}): Promise<TagCounts> {
    try {
      const args = ['themes', '--json'];
      if (opts.top) args.push('--top', String(opts.top));
      const { stdout } = await execa(CONFIDE_BIN, args);
      return JSON.parse(stdout);
    } catch {
      return {};
    }
  }

  async function fetchTimeline(opts = {}): Promise<TimelineCounts> {
    try {
      const args = ['timeline', '--json'];
      if (opts.since) args.push('--since', opts.since);
      const { stdout } = await execa(CONFIDE_BIN, args);
      return JSON.parse(stdout);
    } catch {
      return {};
    }
  }

  async function writeThought(
    text: string,
    onProgress: (status: WriteStatus) => void
  ): Promise<void> {
    try {
      onProgress({ phase: 'logging' });
      const subprocess = execa(CONFIDE_BIN, ['write', text, '--json']);

      await new Promise<void>((resolve, reject) => {
        const readline = createInterface({ input: subprocess.stdout! });

        readline.on('line', (line: string) => {
          try {
            const event = JSON.parse(line);
            if (event.status === 'tagging') {
              onProgress({ phase: 'tagging' });
            } else if (event.status === 'embedding') {
              onProgress({ phase: 'embedding' });
            } else if (event.status === 'done') {
              onProgress({ phase: 'done', id: event.id, tags: event.tags ?? [] });
            } else if (event.status === 'error') {
              onProgress({ phase: 'error', message: event.message });
            }
          } catch {
            // Ignore malformed lines
          }
        });

        readline.on('error', reject);

        subprocess.then(() => resolve()).catch(reject);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onProgress({ phase: 'error', message });
      throw error;
    }
  }

  return {
    fetchStatus,
    fetchLog,
    fetchSearch,
    fetchThemes,
    fetchTimeline,
    writeThought,
  };
}
