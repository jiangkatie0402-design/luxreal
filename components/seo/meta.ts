import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { site } from '@/config/site';

/** Build per-page metadata with canonical + hreflang alternates. */
export function buildMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string; // without locale, '' for home
  title?: string;
  description: string;
}): Metadata {
  const suffix = path ? `/${path}` : '';
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l === 'zh' ? 'zh-CN' : l, `/${l}${suffix}`]),
  );
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: { ...languages, 'x-default': `/${routing.defaultLocale}${suffix}` },
    },
    openGraph: {
      title: title ?? site.name,
      description,
      url: `/${locale}${suffix}`,
      siteName: site.name,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: title ?? site.name, description },
  };
}
