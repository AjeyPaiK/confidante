import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import type { TagCounts } from '../types';

interface ThemesViewProps {
  scrollOffset: number;
}

export const ThemesView: React.FC<ThemesViewProps> = ({ scrollOffset }) => {
  const [tagCounts, setTagCounts] = useState<TagCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const confide = useConfide();

  useEffect(() => {
    setIsLoading(true);
    confide.fetchThemes({ top: 50 }).then((data) => {
      setTagCounts(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const sorted = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  if (sorted.length === 0) {
    return <Text dimColor>No tags yet.</Text>;
  }

  const maxCount = sorted[0][1];

  return (
    <Box flexDirection="column" marginY={0}>
      <Text dimColor marginBottom={1}>
        Topic Frequency
      </Text>
      {sorted.map(([tag, count], idx) => {
        const barWidth = Math.max(1, Math.floor((count / maxCount) * 20));
        const bar = '█'.repeat(barWidth);
        return (
          <Text key={tag}>
            {String(idx + 1).padEnd(2)} {tag.padEnd(15)} {String(count).padEnd(3)} {bar}
          </Text>
        );
      })}
    </Box>
  );
};
