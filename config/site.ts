/**
 * Site-wide configuration. Region-specific values (currency, payment, ICP filing,
 * external hosts) are switched by environment variables so the global and CN sites
 * can be deployed from the same codebase.
 */
const region = process.env.NEXT_PUBLIC_REGION === 'cn' ? 'cn' : 'global';

export const site = {
  name: 'Lux3D',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.lux3d.example',
  region,
  currency: region === 'cn' ? 'CNY' : 'USD',
  currencySymbol: region === 'cn' ? '¥' : '$',
  icp: process.env.NEXT_PUBLIC_ICP ?? '',
  links: {
    app: process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lux3d.example',
    console: process.env.NEXT_PUBLIC_CONSOLE_URL ?? 'https://console.lux3d.example',
    docs: process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.lux3d.example',
    help: process.env.NEXT_PUBLIC_HELP_URL ?? 'https://help.lux3d.example',
    login: (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lux3d.example') + '/login',
  },
  social: [
    { id: 'x', href: 'https://x.com/' },
    { id: 'discord', href: 'https://discord.com/' },
    { id: 'youtube', href: 'https://youtube.com/' },
    { id: 'github', href: 'https://github.com/' },
  ],
  upload: {
    accept: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
  },
} as const;

export function appUrl(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return `${site.links.app}/create${qs ? `?${qs}` : ''}`;
}
