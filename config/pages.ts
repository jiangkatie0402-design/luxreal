/**
 * Registry of every inner page. Text lives in messages under `pages.<id>`.
 * The catch-all route renders these with the matching template.
 */
export type PageTemplate = 'overview' | 'feature' | 'usecase' | 'developer' | 'tool' | 'simple';
export type PageGroup =
  'create' | 'developers' | 'useCases' | 'technology' | 'resources' | 'company' | 'legal';

export interface PageDef {
  id: string;
  path: string; // without locale, no leading slash
  template: PageTemplate;
  group: PageGroup;
}

const p = (id: string, path: string, template: PageTemplate, group: PageGroup): PageDef => ({
  id,
  path,
  template,
  group,
});

export const pages: PageDef[] = [
  p('create', 'create', 'overview', 'create'),
  p('imageTo3d', 'create/image-to-3d', 'feature', 'create'),
  p('textTo3d', 'create/text-to-3d', 'feature', 'create'),
  p('multiView', 'create/multi-view', 'feature', 'create'),
  p('texture', 'create/texture', 'feature', 'create'),
  p('remesh', 'create/remesh', 'feature', 'create'),
  p('split', 'create/split', 'feature', 'create'),
  p('rigging', 'create/rigging', 'feature', 'create'),
  p('animation', 'create/animation', 'feature', 'create'),

  p('developers', 'developers', 'developer', 'developers'),
  p('quickstart', 'developers/quickstart', 'developer', 'developers'),
  p('sdk', 'developers/sdk', 'developer', 'developers'),
  p('integrations', 'developers/integrations', 'developer', 'developers'),
  p('batch', 'developers/batch', 'developer', 'developers'),
  p('changelog', 'developers/changelog', 'developer', 'developers'),

  p('useCases', 'use-cases', 'overview', 'useCases'),
  p('gameAssets', 'use-cases/game-assets', 'usecase', 'useCases'),
  p('printing', 'use-cases/3d-printing', 'usecase', 'useCases'),
  p('ecommerce', 'use-cases/ecommerce', 'usecase', 'useCases'),
  p('film', 'use-cases/film-and-video', 'usecase', 'useCases'),
  p('embodied', 'use-cases/embodied-ai', 'usecase', 'useCases'),
  p('heritage', 'use-cases/cultural-heritage', 'usecase', 'useCases'),

  p('technology', 'technology', 'simple', 'technology'),

  p('resources', 'resources', 'overview', 'resources'),
  p('blog', 'resources/blog', 'simple', 'resources'),
  p('tutorials', 'resources/tutorials', 'simple', 'resources'),
  p('tools', 'resources/tools', 'overview', 'resources'),
  p('viewer', 'resources/tools/3d-viewer', 'tool', 'resources'),
  p('converter', 'resources/tools/format-converter', 'tool', 'resources'),
  p('stlRepair', 'resources/tools/stl-repair', 'tool', 'resources'),
  p('compressor', 'resources/tools/model-compressor', 'tool', 'resources'),

  p('about', 'about', 'simple', 'company'),
  p('careers', 'careers', 'simple', 'company'),
  p('contact', 'contact', 'simple', 'company'),
  p('news', 'news', 'simple', 'company'),
  p('trust', 'trust', 'simple', 'company'),
  p('terms', 'legal/terms', 'simple', 'legal'),
  p('privacy', 'legal/privacy', 'simple', 'legal'),
];

export const pageById = Object.fromEntries(pages.map((pg) => [pg.id, pg])) as Record<
  string,
  PageDef
>;

export const href = (id: string) => `/${pageById[id].path}`;

export const childrenOf = (parentId: string) => {
  const base = pageById[parentId].path + '/';
  return pages.filter(
    (pg) => pg.path.startsWith(base) && !pg.path.slice(base.length).includes('/'),
  );
};

/** Pages with their own route file (not served by the catch-all). */
export const dedicatedPaths = ['gallery', 'pricing'];
