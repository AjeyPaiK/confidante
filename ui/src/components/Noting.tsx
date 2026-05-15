import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import type { WriteStatus } from '../types';

const STARS = ['✦', '✧', '✦', '✧', '✦', '✶'];

interface NotingProps {
  status: WriteStatus;
}

export const Noting: React.FC<NotingProps> = ({ status }) => {
  const [starIdx, setStarIdx] = useState(0);

  useEffect(() => {
    if (
      status.phase === 'idle' ||
      status.phase === 'done' ||
      status.phase === 'error'
    ) {
      return;
    }

    const id = setInterval(() => {
      setStarIdx((i) => (i + 1) % STARS.length);
    }, 280);

    return () => clearInterval(id);
  }, [status.phase]);

  if (status.phase === 'idle') {
    return null;
  }

  const star = STARS[starIdx];

  const phaseLabel =
    status.phase === 'logging'
      ? 'Saving'
      : status.phase === 'tagging'
        ? 'Filing'
        : status.phase === 'embedding'
          ? 'Indexing'
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

  return (
    <Text color="magenta">
      {star} {phaseLabel}
    </Text>
  );
};
