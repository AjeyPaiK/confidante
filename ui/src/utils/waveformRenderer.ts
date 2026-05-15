// Sparkline characters from low to high
const SPARKLINE = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export function embeddingToWaveform(
  embedding: number[],
  maxChars: number = 50,
  showProgress: boolean = false,
  totalDims?: number
): string {
  if (embedding.length === 0) {
    return '';
  }

  // Sample the embedding to fit in maxChars
  const step = Math.max(1, Math.floor(embedding.length / maxChars));
  const sampled: number[] = [];

  for (let i = 0; i < embedding.length; i += step) {
    sampled.push(embedding[i]);
  }

  // Normalize values from [-1, 1] to [0, 7] for sparkline index
  const normalized = sampled.map((val) => {
    const clamped = Math.max(-1, Math.min(1, val));
    const normalized = (clamped + 1) / 2; // Convert [-1, 1] to [0, 1]
    return Math.round(normalized * 7);
  });

  // Convert to sparkline characters
  const waveform = normalized.map((idx) => SPARKLINE[idx]).join('');

  // If showing progress and there are more dims, add placeholder
  if (showProgress && totalDims && sampled.length < totalDims) {
    const remaining = totalDims - sampled.length;
    const remainingChars = Math.ceil((remaining / totalDims) * maxChars);
    return waveform + '░'.repeat(Math.max(0, remainingChars));
  }

  return waveform;
}

export function createProgressWaveform(progress: number, maxChars: number = 50): string {
  const filled = Math.round((progress / 100) * maxChars);
  const empty = maxChars - filled;
  return '▮'.repeat(filled) + '░'.repeat(empty);
}
