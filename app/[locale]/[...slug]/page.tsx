import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { InnerPage } from '@/components/templates/InnerPage';
import { buildMetadata } from '@/components/seo/meta';
import { pages } from '@/config/pages';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string; slug: string[] }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    pages.map((p) => ({ locale, slug: p.path.split('/') })),
  );
}

const find = (slug: string[]) => pages.find((p) => p.path === slug.join('/'));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = find(slug);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    locale,
    path: page.path,
    title: t(`${page.id}.title`),
    description: t(`${page.id}.desc`),
  });
}

export default async function CatchAllPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = find(slug);
  if (!page) notFound();
  return <InnerPage page={page} locale={locale} />;
}
