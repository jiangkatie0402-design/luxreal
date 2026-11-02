import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/components/seo/meta';
import { StageCard } from '@/components/templates/StageCard';
import { ButtonLink } from '@/components/ui/Button';
import { galleryItems } from '@/config/gallery';
import { appUrl } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string; id: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => galleryItems.map((it) => ({ locale, id: it.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale,
    path: `gallery/${id}`,
    title: t(`home.community.items.${id}`),
    description: t('gallery.desc'),
  });
}

export default async function GalleryDetail({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const item = galleryItems.find((it) => it.id === id);
  if (!item) notFound();
  const t = await getTranslations({ locale });
  const title = t(`home.community.items.${id}`);
  const rows: [string, string][] = [
    [t('gallery.detail.input'), t('gallery.detail.inputValue')],
    [t('gallery.detail.author'), item.author],
    [t('gallery.detail.representation'), 'Mesh · PBR · 3D Gaussian'],
    [t('gallery.detail.formats'), 'GLB · FBX · OBJ · USDZ · STL'],
  ];
  return (
    <section className="pt-[var(--header-h)]">
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1.5fr_1fr]">
        <StageCard asset={item.asset} label={title} className="aspect-square lg:aspect-[4/3]" />
        <div>
          <Link href="/gallery" className="text-sm text-muted hover:text-text">
            ← {t('gallery.detail.back')}
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">♥ {item.likes.toLocaleString()}</p>
          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href={appUrl({ remix: item.id })} className="mt-8 w-full">
            {t('gallery.detail.remix')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
