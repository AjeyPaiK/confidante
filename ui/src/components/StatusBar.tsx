import React from 'react';
import { Box, Text } from 'ink';
import type { Mode } from '../types';

interface StatusBarProps {
  mode: Mode;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mode }) => {
  const commands: Mode[] = ['search', 'log', 'themes', 'timeline'];
  const modeNames: Record<Mode, string> = {
    write: 'write',
    search: 'search',
    log: 'log',
    themes: 'themes',
    timeline: 'timeline',
    detail: 'detail',
  };

  const modeHint = mode === 'log' ? '↑↓:select enter:open' : mode === 'detail' ? 'esc:back' : '';

  return (
    <Box flexDirection="column" paddingTop={1}>
      <Box justifyContent="space-between" paddingX={0}>
        <Box gap={3}>
          {commands.map((cmd) => (
            <Text key={cmd} color={mode === cmd ? 'cyan' : 'white'}>
              /{cmd}
            </Text>
          ))}
          <Text color="white">/delete #ID</Text>
        </Box>
        {modeHint && <Text color="yellow">{modeHint}</Text>}
        {!modeHint && <Text color="magenta">ctrl+c:quit</Text>}
      </Box>
    </Box>
  );
};
