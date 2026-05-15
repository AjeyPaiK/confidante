import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import type { TimelineCounts } from '../types';

interface TimelineViewProps {
  scrollOffset: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ scrollOffset }) => {
  const [timeline, setTimeline] = useState<TimelineCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const confide = useConfide();

  useEffect(() => {
    setIsLoading(true);
    confide.fetchTimeline({ since: '30d' }).then((data) => {
      setTimeline(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <Text color="magenta">Loading...</Text>;
  }

  const sorted = Object.entries(timeline).sort(([a], [b]) => a.localeCompare(b));

  if (sorted.length === 0) {
    return <Text color="magenta">No entries in the last 30 days.</Text>;
  }

  const maxCount = Math.max(...sorted.map(([, count]) => count));

  return (
    <Box flexDirection="column" marginY={0}>
      <Text color="cyan" marginBottom={1}>
        Entry Frequency Over Time
      </Text>
      {sorted.map(([date, count]) => {
        const barWidth = Math.max(1, Math.floor((count / maxCount) * 40));
        const bar = '▄'.repeat(barWidth);
        return (
          <Text key={date} color="yellow">
            {date} {bar} {count}
          </Text>
        );
      })}
    </Box>
  );
};
