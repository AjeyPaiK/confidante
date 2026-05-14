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
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderBottom></Box>
      <Box justifyContent="space-between" paddingX={1}>
        <Box gap={2}>
          {commands.map((cmd) => (
            <Text key={cmd} dimColor={mode !== cmd}>
              /{cmd}
            </Text>
          ))}
        </Box>
        <Text dimColor>ctrl+c:quit</Text>
      </Box>
    </Box>
  );
};
