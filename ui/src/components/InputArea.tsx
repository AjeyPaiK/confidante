import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import type { Mode, WriteStatus } from '../types';

interface InputAreaProps {
  mode: Mode;
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  writeStatus: WriteStatus;
}

const getPlaceholder = (mode: Mode): string => {
  switch (mode) {
    case 'write':
      return 'just start typing a thought...';
    case 'search':
      return 'search your thoughts...';
    case 'log':
    case 'themes':
    case 'timeline':
      return 'press Escape to write';
  }
};

const getPrompt = (mode: Mode): string => {
  switch (mode) {
    case 'write':
      return '> ';
    case 'search':
      return '🔍 ';
    case 'log':
      return '📋 ';
    case 'themes':
      return '🏷  ';
    case 'timeline':
      return '📅 ';
  }
};

export const InputArea: React.FC<InputAreaProps> = ({
  mode,
  value,
  isLoading,
  onChange,
  onSubmit,
  writeStatus,
}) => {
  const statusMessage = (() => {
    if (writeStatus.phase === 'idle') return '';
    if (writeStatus.phase === 'logging') return '⠋ Logging...';
    if (writeStatus.phase === 'tagging') return '⠙ Tagging...';
    if (writeStatus.phase === 'embedding') return '⠹ Embedding...';
    if (writeStatus.phase === 'done')
      return `✓ #${writeStatus.id}  ${writeStatus.tags.join('  ')}`;
    if (writeStatus.phase === 'error') return `✗ ${writeStatus.message}`;
    return '';
  })();

  const statusColor = (() => {
    if (writeStatus.phase === 'error') return 'red';
    if (writeStatus.phase === 'done') return 'green';
    return 'white';
  })();

  return (
    <Box flexDirection="column">
      {statusMessage && (
        <Text color={statusColor} bold={writeStatus.phase === 'done' || writeStatus.phase === 'error'}>
          {statusMessage}
        </Text>
      )}
      <Box borderStyle="round" borderTop></Box>
      <Box>
        <Text>{getPrompt(mode)}</Text>
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={(text) => {
            if (text.trim()) onSubmit(text);
          }}
          placeholder={getPlaceholder(mode)}
        />
      </Box>
    </Box>
  );
};
