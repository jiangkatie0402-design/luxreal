import { setRequestLocale } from 'next-intl/server';
import { Advantages } from '@/components/home/Advantages';
import { Community } from '@/components/home/Community';
import { FAQ } from '@/components/home/FAQ';
import { FinalCTA } from '@/components/home/FinalCTA';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <HowItWorks />
      <Advantages />
      <Testimonials />
      <Community />
      <FinalCTA />
      <FAQ />
    </>
  );
}
