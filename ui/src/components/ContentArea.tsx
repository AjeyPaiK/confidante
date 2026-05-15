import React from 'react';
import { Box } from 'ink';
import { WriteView } from './WriteView';
import { LogView } from './LogView';
import { SearchView } from './SearchView';
import { ThemesView } from './ThemesView';
import { TimelineView } from './TimelineView';
import { DetailView } from './DetailView';
import type { Mode, WriteStatus } from '../types';

interface ContentAreaProps {
  mode: Mode;
  query: string;
  scrollOffset: number;
  writeStatus: WriteStatus;
  selectedThoughtId: number | null;
  onSelectThought: (id: number | null) => void;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  mode,
  query,
  scrollOffset,
  writeStatus,
  selectedThoughtId,
  onSelectThought,
}) => {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden" marginY={0}>
      {mode === 'write' && <WriteView writeStatus={writeStatus} />}
      {mode === 'log' && <LogView scrollOffset={scrollOffset} selectedId={selectedThoughtId} onSelect={onSelectThought} />}
      {mode === 'search' && <SearchView query={query} scrollOffset={scrollOffset} />}
      {mode === 'themes' && <ThemesView scrollOffset={scrollOffset} />}
      {mode === 'timeline' && <TimelineView scrollOffset={scrollOffset} writeStatus={writeStatus} />}
      {mode === 'detail' && selectedThoughtId && <DetailView thoughtId={selectedThoughtId} />}
    </Box>
  );
};
