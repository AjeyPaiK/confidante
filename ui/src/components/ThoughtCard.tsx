import React from 'react';
import { Box, Text } from 'ink';
import type { ThoughtRow } from '../types';

interface ThoughtCardProps {
  thought: ThoughtRow;
  score?: number;
  compact?: boolean;
}

const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score > 0.85) return { label: 'very relevant', color: 'green' };
  if (score > 0.7) return { label: 'relevant', color: 'cyan' };
  if (score > 0.55) return { label: 'somewhat related', color: 'yellow' };
  return { label: '', color: '' };
};

export const ThoughtCard: React.FC<ThoughtCardProps> = ({
  thought,
  score,
  compact = false,
}) => {
  const date = new Date(thought.created_at);
  const timestamp = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tagsStr = thought.tags.length > 0 ? thought.tags.join(' ') : '(no tags)';
  const scoreLabel = score !== undefined ? getScoreLabel(score) : null;
  const scorePart = scoreLabel && scoreLabel.label ? ` ${scoreLabel.label}` : '';

  if (compact) {
    const truncated =
      thought.body.length > 60 ? thought.body.substring(0, 60) + '...' : thought.body;
    return (
      <Box flexDirection="column" marginY={0}>
        <Text color="cyan">
          #{thought.id} • {timestamp}
        </Text>
        <Text>  {truncated}</Text>
        {tagsStr !== '(no tags)' && (
          <Text color="magenta">  {tagsStr}{scorePart}</Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Text color="cyan">
        #{thought.id} • {timestamp}
      </Text>
      <Text marginY={0}>{thought.body}</Text>
      <Text color="magenta">
        {tagsStr}
        {scorePart}
      </Text>
    </Box>
  );
};
