import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import { ThoughtCard } from './ThoughtCard';
import type { SearchResult } from '../types';

interface SearchViewProps {
  query: string;
  scrollOffset: number;
}

export const SearchView: React.FC<SearchViewProps> = ({ query, scrollOffset }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const confide = useConfide();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    confide.fetchSearch(query, { top: 10 }).then((data) => {
      setResults(data);
      setIsLoading(false);
    });
  }, [query]);

  if (!query) {
    return <Text color="magenta">Type a search query and press Enter...</Text>;
  }

  if (isLoading) {
    return <Text color="magenta">Searching...</Text>;
  }

  if (results.length === 0) {
    return <Text color="magenta">No results found for "{query}"</Text>;
  }

  const visibleCount = 10;
  const visible = results.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box flexDirection="column" marginY={0}>
      <Text color="cyan" marginY={0} marginBottom={1}>
        Found {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>
      {visible.map((t) => (
        <ThoughtCard key={t.id} thought={t} score={t.score} compact />
      ))}
    </Box>
  );
};
