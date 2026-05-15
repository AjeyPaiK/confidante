import type { GraphData, GraphPosition } from '../types';

interface GridCell {
  char: string;
  layer: number; // 0=edge, 1=node, 2=label
}

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
  const padding = 2;
  const graphWidth = width - padding * 2;
  const graphHeight = Math.max(height - 4, 5);

  // Create grid
  const grid: GridCell[][] = Array(graphHeight)
    .fill(null)
    .map(() =>
      Array(graphWidth)
        .fill(null)
        .map(() => ({ char: ' ', layer: 0 }))
    );

  // Helper to convert position to grid coords
  const toGrid = (x: number, y: number) => {
    const gx = Math.round(((x - minX) / rangeX) * (graphWidth - 1));
    const gy = Math.round(((y - minY) / rangeY) * (graphHeight - 1));
    return {
      x: Math.max(0, Math.min(graphWidth - 1, gx)),
      y: Math.max(0, Math.min(graphHeight - 1, gy)),
    };
  };

  // Draw edges
  for (const edge of data.edges) {
    const pos1 = positions.find((p) => p.id === edge.source);
    const pos2 = positions.find((p) => p.id === edge.target);
    if (!pos1 || !pos2) continue;

    const g1 = toGrid(pos1.x, pos1.y);
    const g2 = toGrid(pos2.x, pos2.y);

    // Bresenham line algorithm for ASCII edges
    drawLine(grid, g1.x, g1.y, g2.x, g2.y);
  }

  // Draw nodes
  const nodeMap = new Map(positions.map((p) => [p.id, p]));
  for (const node of data.nodes) {
    const pos = nodeMap.get(node.id);
    if (!pos) continue;

    const g = toGrid(pos.x, pos.y);
    if (g.y >= 0 && g.y < graphHeight && g.x >= 0 && g.x < graphWidth) {
      grid[g.y][g.x] = { char: '●', layer: 1 };
    }
  }

  // Convert grid to string with padding
  const lines = grid.map((row) => '  ' + row.map((cell) => cell.char).join(''));
  const header = `${data.nodes.length} nodes • ${data.edges.length} edges`;
  const footer = '';

  return [header, ...lines, footer].join('\n');
}

function drawLine(
  grid: GridCell[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x].layer === 0) {
        // Only draw if not already a node
        const char = dx > dy ? '─' : '│';
        grid[y][x] = { char, layer: 0 };
      }
    }

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}
