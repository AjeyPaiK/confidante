import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  entryCount: number;
}

export const Header: React.FC<HeaderProps> = ({ entryCount }) => {
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Box justifyContent="space-between" paddingX={0}>
        <Text color="yellow" bold>
          confidante
        </Text>
        <Text color="magenta">
          {entryCount === 1 ? '1 thought' : `${entryCount} thoughts`}
        </Text>
      </Box>
    </Box>
  );
};
