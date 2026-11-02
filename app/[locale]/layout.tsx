import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileCTA } from '@/components/layout/MobileNav';
import { themeScript } from '@/components/layout/ThemeToggle';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/components/seo/meta';
import { site } from '@/config/site';
import { routing } from '@/i18n/routing';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(site.url),
    title: { default: t('siteTitle'), template: `%s · ${site.name}` },
    ...buildMetadata({ locale, path: '', description: t('siteDescription') }),
  };
}

export const viewport: Viewport = {
  themeColor: '#060a13',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: site.name,
            url: site.url,
            sameAs: site.social.map((s) => s.href),
          }}
        />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="fixed left-4 top-2 z-[60] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm text-on-accent focus:translate-y-0"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileCTA />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
