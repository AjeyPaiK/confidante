import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import { ThoughtCard } from './ThoughtCard';
import type { ThoughtRow } from '../types';

interface LogViewProps {
  scrollOffset: number;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const LogView: React.FC<LogViewProps> = ({ scrollOffset, selectedId, onSelect }) => {
  const [thoughts, setThoughts] = useState<ThoughtRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const confide = useMemo(() => useConfide(), []);

  useEffect(() => {
    setIsLoading(true);
    confide.fetchLog({ limit: 100 }).then((data) => {
      setThoughts(data);
      setIsLoading(false);
    });
  }, [confide]);

  // Update selected thought when scrolling
  useEffect(() => {
    if (thoughts.length > 0 && scrollOffset < thoughts.length) {
      onSelect(thoughts[scrollOffset].id);
    }
  }, [scrollOffset, thoughts, onSelect]);

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
      {visible.map((t, idx) => {
        const isSelected = selectedId === t.id;
        return (
          <Box key={t.id} flexDirection="column" marginY={0} borderStyle={isSelected ? 'round' : undefined} borderColor={isSelected ? 'cyan' : undefined}>
            <ThoughtCard thought={t} compact />
          </Box>
        );
      })}
    </Box>
  );
};
