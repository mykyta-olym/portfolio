export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const smoothstep = (t: number): number => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

export const easeOutCubic = (t: number): number => 1 - (1 - clamp(t)) ** 3;

/** Frame-rate independent smoothing factor for an exponential follow. */
export const damp = (lambda: number, deltaSeconds: number): number => 1 - Math.exp(-lambda * deltaSeconds);
