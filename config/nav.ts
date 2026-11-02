export interface NavMenu {
  key: 'create' | 'developers' | 'useCases' | 'resources';
  items: string[]; // page ids
}
export interface NavLink {
  key: 'gallery' | 'technology' | 'pricing';
  href: string;
}

export type NavEntry = ({ type: 'menu' } & NavMenu) | ({ type: 'link' } & NavLink);

export const mainNav: NavEntry[] = [
  {
    type: 'menu',
    key: 'create',
    items: [
      'imageTo3d',
      'textTo3d',
      'multiView',
      'texture',
      'remesh',
      'split',
      'rigging',
      'animation',
    ],
  },
  {
    type: 'menu',
    key: 'developers',
    items: ['quickstart', 'sdk', 'integrations', 'batch', 'changelog'],
  },
  {
    type: 'menu',
    key: 'useCases',
    items: ['gameAssets', 'printing', 'ecommerce', 'film', 'embodied', 'heritage'],
  },
  { type: 'link', key: 'gallery', href: '/gallery' },
  { type: 'link', key: 'technology', href: '/technology' },
  { type: 'link', key: 'pricing', href: '/pricing' },
  { type: 'menu', key: 'resources', items: ['blog', 'tutorials', 'tools', 'changelog'] },
];

export const footerColumns: {
  key: string;
  items: { id?: string; href?: string; label?: string }[];
}[] = [
  {
    key: 'product',
    items: [
      { id: 'imageTo3d' },
      { id: 'textTo3d' },
      { id: 'texture' },
      { id: 'rigging' },
      { href: '/pricing', label: 'pricing' },
    ],
  },
  {
    key: 'developers',
    items: [
      { id: 'quickstart' },
      { id: 'sdk' },
      { id: 'integrations' },
      { id: 'batch' },
      { id: 'changelog' },
    ],
  },
  {
    key: 'useCases',
    items: [
      { id: 'gameAssets' },
      { id: 'printing' },
      { id: 'ecommerce' },
      { id: 'film' },
      { id: 'embodied' },
      { id: 'heritage' },
    ],
  },
  {
    key: 'resources',
    items: [
      { href: '/gallery', label: 'gallery' },
      { id: 'blog' },
      { id: 'tutorials' },
      { id: 'tools' },
      { id: 'technology' },
    ],
  },
  {
    key: 'company',
    items: [{ id: 'about' }, { id: 'careers' }, { id: 'news' }, { id: 'contact' }, { id: 'trust' }],
  },
  { key: 'legal', items: [{ id: 'terms' }, { id: 'privacy' }] },
];
