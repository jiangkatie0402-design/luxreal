import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/Section';
import { faqJsonLd, JsonLd } from '@/components/seo/JsonLd';

const KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export function FAQ() {
  const t = useTranslations('home.faq');
  const items = KEYS.map((k) => ({ q: t(`items.${k}.q`), a: t(`items.${k}.a`) }));
  return (
    <section aria-labelledby="faq-title" className="section-y pt-0">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_2fr]">
        <SectionHeading id="faq-title" title={t('title')} />
        <Accordion items={items} />
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
