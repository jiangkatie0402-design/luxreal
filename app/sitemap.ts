import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [''];
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
