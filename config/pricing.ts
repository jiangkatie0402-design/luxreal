/** Placeholder pricing data — replace when pricing is final. */
export const creatorPlans = [
  { id: 'free', monthly: 0, credits: 200, highlight: false },
  { id: 'personal', monthly: 16, credits: 1000, highlight: false },
  { id: 'pro', monthly: 48, credits: 4000, highlight: true },
  { id: 'team', monthly: 120, credits: 12000, highlight: false },
] as const;

export const apiUnitPrice = {
  standard: { mesh: 0.2, pbr: 0.3, gaussian: 0.25 },
  turbo: { mesh: 0.1, pbr: 0.15, gaussian: 0.12 },
} as const;
