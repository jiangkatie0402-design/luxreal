import { notFound } from 'next/navigation';
import { ThumbSheet } from './ThumbSheet';

export const metadata = { robots: { index: false } };

/** Development-only: renders every thumbnail so scripts/render-thumbs.mjs can capture them. */
export default function ThumbsDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ThumbSheet />;
}
