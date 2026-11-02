/**
 * PLACEHOLDER benchmark + partner data for the homepage trust section.
 * Replace with figures from the algorithm team and approved partner logos.
 */
export const benchmark = {
  metrics: [
    { id: 'geometry', lux: 0.87, base: 0.74, format: 'score' },
    { id: 'material', lux: 0.82, base: 0.63, format: 'score' },
    { id: 'preference', lux: 0.68, base: 0.32, format: 'percent' },
  ],
} as const;

/** Partner slots. `logo` takes an approved SVG path in /public/partners when available. */
export const partners: { id: string; logo?: string }[] = Array.from({ length: 8 }, (_, i) => ({
  id: `partner-${String(i + 1).padStart(2, '0')}`,
}));
