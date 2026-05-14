import React from 'ink';
import { Box } from 'ink';
import { WriteView } from './WriteView';
import { LogView } from './LogView';
import { SearchView } from './SearchView';
import { ThemesView } from './ThemesView';
import { TimelineView } from './TimelineView';
import type { Mode, WriteStatus } from '../types';

interface ContentAreaProps {
  mode: Mode;
  query: string;
  scrollOffset: number;
  writeStatus: WriteStatus;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  mode,
  query,
  scrollOffset,
  writeStatus,
}) => {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden" marginY={0}>
      {mode === 'write' && <WriteView writeStatus={writeStatus} />}
      {mode === 'log' && <LogView scrollOffset={scrollOffset} />}
      {mode === 'search' && <SearchView query={query} scrollOffset={scrollOffset} />}
      {mode === 'themes' && <ThemesView scrollOffset={scrollOffset} />}
      {mode === 'timeline' && <TimelineView scrollOffset={scrollOffset} />}
    </Box>
  );
};
