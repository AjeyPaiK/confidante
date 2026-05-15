import React from 'react';
import { Box, Text } from 'ink';
import { GraphView } from './GraphView';
import type { WriteStatus } from '../types';

interface WriteViewProps {
  writeStatus: WriteStatus;
}

export const WriteView: React.FC<WriteViewProps> = ({ writeStatus }) => {
  const refreshTrigger = writeStatus.phase === 'done' ? Math.random() : 0;

  const statusMessage =
    writeStatus.phase === 'idle'
      ? ''
      : writeStatus.phase === 'logging'
        ? 'Logging...'
        : writeStatus.phase === 'tagging'
          ? 'Tagging...'
          : writeStatus.phase === 'embedding'
            ? 'Embedding...'
            : writeStatus.phase === 'done'
              ? `✓ #${writeStatus.id} logged  ${writeStatus.tags.join('  ')}`
              : writeStatus.phase === 'error'
                ? `✗ ${writeStatus.message}`
                : '';

  return (
    <Box flexDirection="column" marginY={0}>
      {statusMessage && (
        <Text
          color={
            writeStatus.phase === 'error'
              ? 'red'
              : writeStatus.phase === 'done'
                ? 'green'
                : 'white'
          }
          bold={writeStatus.phase === 'done' || writeStatus.phase === 'error'}
        >
          {statusMessage}
        </Text>
      )}
      <GraphView refreshTrigger={refreshTrigger} />
    </Box>
  );
};
