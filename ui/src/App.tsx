import React, { useEffect, useState } from 'react';
import { Box, useInput } from 'ink';
import { Header } from './components/Header';
import { ContentArea } from './components/ContentArea';
import { InputArea } from './components/InputArea';
import { StatusBar } from './components/StatusBar';
import { useConfide } from './hooks/useConfide';
import type { Mode, WriteStatus } from './types';

export const App = () => {
  const [mode, setMode] = useState<Mode>('write');
  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [entryCount, setEntryCount] = useState(0);
  const [writeStatus, setWriteStatus] = useState<WriteStatus>({ phase: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedThoughtId, setSelectedThoughtId] = useState<number | null>(null);
  const confide = useConfide();

  useEffect(() => {
    confide.fetchStatus().then((status) => {
      setEntryCount(status.entries);
    });
  }, [writeStatus.phase === 'done']);

  useInput((input, key) => {
    if (key.escape) {
      setMode('write');
      setInputText('');
      setQuery('');
      setScrollOffset(0);
      setSelectedThoughtId(null);
    } else if (key.upArrow && scrollOffset > 0) {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setScrollOffset((prev) => prev + 1);
    } else if (key.return && mode === 'log' && selectedThoughtId) {
      setMode('detail');
    }
  });

  const handleSubmit = async (text: string) => {
    // Check for exit command
    if (text === '/exit') {
      process.exit(0);
    }

    // Check for mode switching
    if (text === '/log') {
      setMode('log');
      setInputText('');
      setScrollOffset(0);
      setSelectedThoughtId(null);
      return;
    }
    if (text === '/themes') {
      setMode('themes');
      setInputText('');
      setScrollOffset(0);
      return;
    }
    if (text === '/timeline') {
      setMode('timeline');
      setInputText('');
      setScrollOffset(0);
      return;
    }
    if (text.startsWith('/search')) {
      const searchQuery = text.slice(7).trim();
      setMode('search');
      setQuery(searchQuery);
      setInputText('');
      setScrollOffset(0);
      return;
    }
    if (text.startsWith('/delete')) {
      const idStr = text.slice(7).trim();
      const thoughtId = parseInt(idStr, 10);
      if (thoughtId) {
        try {
          await confide.deleteThought(thoughtId);
          setInputText('');
          setEntryCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Delete error:', error);
        }
      }
      return;
    }

    // Handle per-mode input
    if (mode === 'write') {
      setIsLoading(true);
      try {
        await confide.writeThought(text, (status) => {
          setWriteStatus(status);
        });
        setInputText('');
        // Reset status after 2 seconds
        setTimeout(() => {
          setWriteStatus({ phase: 'idle' });
        }, 2000);
      } catch (error) {
        console.error('Write error:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'search') {
      setScrollOffset(0);
      setQuery(text);
    }
  };

  const terminalHeight = process.stdout.rows ?? 24;

  return (
    <Box flexDirection="column" height={terminalHeight} paddingX={0} paddingY={0}>
      <Header entryCount={entryCount} />
      <ContentArea
        mode={mode}
        query={query}
        scrollOffset={scrollOffset}
        writeStatus={writeStatus}
        selectedThoughtId={selectedThoughtId}
        onSelectThought={setSelectedThoughtId}
      />
      <InputArea
        mode={mode}
        value={inputText}
        isLoading={isLoading}
        onChange={setInputText}
        onSubmit={handleSubmit}
        writeStatus={writeStatus}
      />
      <StatusBar mode={mode} />
    </Box>
  );
};
