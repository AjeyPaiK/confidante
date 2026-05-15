import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import { ThoughtCard } from './ThoughtCard';
import type { ThoughtRow, WriteStatus } from '../types';

interface WriteViewProps {
  writeStatus: WriteStatus;
}

export const WriteView: React.FC<WriteViewProps> = ({ writeStatus }) => {
  const [thoughts, setThoughts] = useState<ThoughtRow[]>([]);
  const confide = useConfide();

  useEffect(() => {
    confide.fetchLog({ limit: 5 }).then(setThoughts);
  }, [writeStatus.phase === 'done']);

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
      {thoughts.length > 0 && (
        <>
          <Text color="cyan" marginY={1}>
            Recent:
          </Text>
          {thoughts.map((t) => (
            <ThoughtCard key={t.id} thought={t} compact />
          ))}
        </>
      )}
      {thoughts.length === 0 && (
        <Text color="magenta">No thoughts yet. Start typing to create your first entry.</Text>
      )}
    </Box>
  );
};
