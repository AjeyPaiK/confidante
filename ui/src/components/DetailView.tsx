import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import type { ThoughtRow } from '../types';

interface DetailViewProps {
  thoughtId: number;
}

export const DetailView: React.FC<DetailViewProps> = ({ thoughtId }) => {
  const [thought, setThought] = useState<ThoughtRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const confide = useConfide();

  useEffect(() => {
    setIsLoading(true);
    confide.fetchLog({ limit: 1000 }).then((thoughts) => {
      const found = thoughts.find((t) => t.id === thoughtId);
      setThought(found || null);
      setIsLoading(false);
    });
  }, [thoughtId, confide]);

  if (isLoading) {
    return <Text color="magenta">Loading...</Text>;
  }

  if (!thought) {
    return <Text color="red">Thought not found</Text>;
  }

  const date = new Date(thought.created_at);
  const timestamp = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box flexDirection="column" marginY={0} paddingX={1}>
      <Text color="cyan">
        #{thought.id} • {timestamp}
      </Text>
      <Text marginY={1}>{thought.body}</Text>
      {thought.tags.length > 0 && (
        <Text color="magenta">Tags: {thought.tags.join(' • ')}</Text>
      )}
      <Text color="gray" marginTop={1}>
        (Press Escape to go back)
      </Text>
    </Box>
  );
};
