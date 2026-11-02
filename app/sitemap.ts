import type { MetadataRoute } from 'next';
import { galleryItems } from '@/config/gallery';
import { pages } from '@/config/pages';
import { site } from '@/config/site';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '',
    'gallery',
    'pricing',
    ...pages.map((p) => p.path),
    ...galleryItems.map((g) => `gallery/${g.id}`),
  ];
  return paths.map((path) => {
    const suffix = path ? `/${path}` : '';
    return {
      url: `${site.url}/${routing.defaultLocale}${suffix}`,
      changeFrequency: 'weekly',
      priority: path ? 0.7 : 1,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l === 'zh' ? 'zh-CN' : l, `${site.url}/${l}${suffix}`]),
        ),
      },
    };
  });
}
