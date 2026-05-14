import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { Noting } from './Noting';
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
  if (mode === 'write') {
    return "what's on your mind?";
  }
  if (mode === 'search') {
    return 'search your thoughts...';
  }
  return 'press Escape to start writing';
};

export const InputArea: React.FC<InputAreaProps> = ({
  mode,
  value,
  isLoading,
  onChange,
  onSubmit,
  writeStatus,
}) => {
  return (
    <Box flexDirection="column">
      <Noting status={writeStatus} />
      <Box borderStyle="round" borderTop></Box>
      <Box>
        <Text>> </Text>
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
