import type { GraphData } from '../types';

export function renderGraph(data: GraphData, width: number, height: number): string {
  if (data.nodes.length === 0) {
    return '(no thoughts yet)';
  }

  // Find bounds of positions
  const positions = Object.entries(data.positions).map(([id, pos]) => ({
    id: parseInt(id),
    x: pos.x,
    y: pos.y,
  }));

  if (positions.length === 0) {
    return '(no positions)';
  }

  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const graphWidth = width - 4;
  const graphHeight = Math.max(height - 4, 8);

  // Create grid
  const grid: string[][] = Array(graphHeight)
    .fill(null)
    .map(() => Array(graphWidth).fill(' '));

  // Helper to convert position to grid coords
  const toGrid = (x: number, y: number) => {
    const gx = Math.round(((x - minX) / rangeX) * (graphWidth - 1));
    const gy = Math.round(((y - minY) / rangeY) * (graphHeight - 1));
    return {
      x: Math.max(0, Math.min(graphWidth - 1, gx)),
      y: Math.max(0, Math.min(graphHeight - 1, gy)),
    };
  };

  // Draw nodes
  const nodeMap = new Map(positions.map((p) => [p.id, p]));
  for (const node of data.nodes) {
    const pos = nodeMap.get(node.id);
    if (!pos) continue;

    const g = toGrid(pos.x, pos.y);
    if (g.y >= 0 && g.y < graphHeight && g.x >= 0 && g.x < graphWidth) {
      grid[g.y][g.x] = '●';
    }
  }

  // Convert grid to string with padding
  const lines = grid.map((row) => '  ' + row.join(''));
  const header = `${data.nodes.length} thoughts • ${data.edges.length} connections`;

  return [header, ...lines].join('\n');
}
