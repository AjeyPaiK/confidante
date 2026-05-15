import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import { ThoughtCard } from './ThoughtCard';
import type { ThoughtRow } from '../types';

interface LogViewProps {
  scrollOffset: number;
}

export const LogView: React.FC<LogViewProps> = ({ scrollOffset }) => {
  const [thoughts, setThoughts] = useState<ThoughtRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const confide = useConfide();

  useEffect(() => {
    setIsLoading(true);
    confide.fetchLog({ limit: 100 }).then((data) => {
      setThoughts(data);
      setIsLoading(false);
    });
  }, []);

  const visibleCount = 10;
  const visible = thoughts.slice(scrollOffset, scrollOffset + visibleCount);

  if (isLoading) {
    return <Text color="magenta">Loading...</Text>;
  }

  if (thoughts.length === 0) {
    return <Text color="magenta">No thoughts yet.</Text>;
  }

  return (
    <Box flexDirection="column" marginY={0}>
      <Text color="cyan" marginY={0} marginBottom={1}>
        Showing {visible.length} of {thoughts.length}
      </Text>
      {visible.map((t) => (
        <ThoughtCard key={t.id} thought={t} compact />
      ))}
    </Box>
  );
};
