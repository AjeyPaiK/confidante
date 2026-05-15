import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { useConfide } from '../hooks/useConfide';
import { renderGraph } from '../utils/graphRenderer';
import type { GraphData } from '../types';

interface GraphViewProps {
  refreshTrigger?: number;
}

export const GraphView: React.FC<GraphViewProps> = ({ refreshTrigger = 0 }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [], positions: {} });
  const [isLoading, setIsLoading] = useState(true);
  const confide = useConfide();

  useEffect(() => {
    setIsLoading(true);
    confide.fetchGraph().then((data) => {
      setGraphData(data);
      setIsLoading(false);
    });
  }, [refreshTrigger]);

  const terminalHeight = process.stdout.rows ?? 24;
  const terminalWidth = process.stdout.columns ?? 80;
  const graphHeight = Math.max(terminalHeight - 10, 8);
  const graphWidth = terminalWidth;

  if (isLoading) {
    return <Text color="magenta">Loading graph...</Text>;
  }

  if (graphData.nodes.length === 0) {
    return <Text color="magenta">No thoughts yet. Start typing to create your first entry.</Text>;
  }

  const rendered = renderGraph(graphData, graphWidth, graphHeight);

  return (
    <Box flexDirection="column" marginY={0}>
      <Text color="cyan" marginBottom={0}>
        Graph:
      </Text>
      {rendered.split('\n').map((line, idx) => (
        <Text key={idx} color={idx === 0 ? 'magenta' : undefined}>
          {line}
        </Text>
      ))}
    </Box>
  );
};
