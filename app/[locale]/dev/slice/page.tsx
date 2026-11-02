import { notFound } from 'next/navigation';
import { SliceLab } from './SliceLab';

export const metadata = { robots: { index: false } };

/** Development-only test bench for the GenerationSlice component. */
export default function SliceDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <SliceLab />;
}
