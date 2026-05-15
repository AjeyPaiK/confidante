import React, { useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import { embeddingToWaveform } from '../utils/waveformRenderer';
import type { WriteStatus } from '../types';

const STARS = ['✦', '✧', '✦', '✧', '✦', '✶'];
const SHIMMER = ['▁', '▃', '▅', '▇', '▅', '▃', '▁'];

interface NotingProps {
  status: WriteStatus;
}

export const Noting: React.FC<NotingProps> = ({ status }) => {
  const embedding = status.phase !== 'idle' && status.phase !== 'done' && status.phase !== 'error' && 'embedding' in status ? status.embedding : undefined;
  const elapsed = status.phase !== 'idle' && status.phase !== 'error' && 'elapsed' in status ? status.elapsed : 0;
  const tokens = status.phase !== 'idle' && status.phase !== 'error' && 'tokens' in status ? status.tokens : 0;
  const [starIdx, setStarIdx] = useState(0);
  const [shimmerIdx, setShimmerIdx] = useState(0);
  const [tickIdx, setTickIdx] = useState(0);

  useEffect(() => {
    if (
      status.phase === 'idle' ||
      status.phase === 'done' ||
      status.phase === 'error'
    ) {
      return;
    }

    const starId = setInterval(() => {
      setStarIdx((i) => (i + 1) % STARS.length);
    }, 280);

    const shimmerId = setInterval(() => {
      setShimmerIdx((i) => (i + 1) % SHIMMER.length);
    }, 150);

    const tickId = setInterval(() => {
      setTickIdx((i) => (i + 1) % 4);
    }, 400);

    return () => {
      clearInterval(starId);
      clearInterval(shimmerId);
      clearInterval(tickId);
    };
  }, [status.phase]);

  if (status.phase === 'idle') {
    return null;
  }

  const star = STARS[starIdx];
  const shimmer = SHIMMER[shimmerIdx];
  const ticker = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'][tickIdx % 10];

  const phaseLabel =
    status.phase === 'logging'
      ? 'Saving'
      : status.phase === 'tagging'
        ? 'Filing'
        : status.phase === 'embedding'
          ? 'Indexing'
          : '';

  const detailedMessage =
    status.phase === 'logging'
      ? 'Writing thought to database...'
      : status.phase === 'tagging'
        ? 'Extracting topic tags...'
        : status.phase === 'embedding'
          ? 'Computing semantic embedding...'
          : '';

  if (status.phase === 'done') {
    return (
      <Text color="green">
        ✓ Noted • {status.tags.join(' • ')}
      </Text>
    );
  }

  if (status.phase === 'error') {
    return (
      <Text color="red">
        ✗ {status.message}
      </Text>
    );
  }

  // Create shimmering effect on label
  const shimmerLabel = phaseLabel
    .split('')
    .map((char, idx) => (idx === Math.floor(shimmerIdx * (phaseLabel.length / SHIMMER.length)) ? shimmer : char))
    .join('');

  // Show waveform for embedding phase
  const waveformDisplay =
    status.phase === 'embedding' && embedding && embedding.length > 0
      ? embeddingToWaveform(embedding, 40, true, 768)
      : '';

  return (
    <Box flexDirection="column">
      <Text color="magenta">
        {ticker} {detailedMessage} [{elapsed}s] {tokens > 0 ? `{${tokens}}` : ''}
      </Text>
      <Text color="magenta">
        {star} {shimmerLabel}
      </Text>
      {waveformDisplay && (
        <Text color="cyan">
          {waveformDisplay}
        </Text>
      )}
    </Box>
  );
};
