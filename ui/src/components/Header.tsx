import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  entryCount: number;
}

export const Header: React.FC<HeaderProps> = ({ entryCount }) => {
  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between" paddingX={1}>
        <Text bold dimColor>
          confidante
        </Text>
        <Text dimColor>
          {entryCount === 1 ? '1 thought' : `${entryCount} thoughts`}
        </Text>
      </Box>
      <Box borderStyle="round" borderTop></Box>
    </Box>
  );
};
