import { getTranslations } from 'next-intl/server';
import { childrenOf, href, pages, type PageDef } from '@/config/pages';
import { site } from '@/config/site';
import type { AssetId } from '@/config/assets';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { quickstartSamples } from '@/components/ui/codeSamples';
import { Badge, Card, SectionHeading } from '@/components/ui/Section';
import { PageHero } from './PageHero';
import { StageCard } from './StageCard';

const HERO_ASSET: Partial<Record<string, AssetId>> = {
  imageTo3d: 'dog',
  multiView: 'chest',
  texture: 'vase',
  remesh: 'rock',
  split: 'house',
  rigging: 'dog',
  animation: 'robot',
  gameAssets: 'chest',
  printing: 'dog',
  ecommerce: 'vase',
  film: 'tree',
  embodied: 'robot',
  heritage: 'vase',
};

/** Renders any registered inner page with the template its definition names. */
export async function InnerPage({ page, locale }: { page: PageDef; locale: string }) {
  const t = await getTranslations({ locale });
  const title = t(`pages.${page.id}.title`);
  const desc = t(`pages.${page.id}.desc`);
  const groupRoot = pages.find((p) => p.group === page.group && !p.path.includes('/'));
  const eyebrow =
    groupRoot && groupRoot.id !== page.id ? t(`pages.${groupRoot.id}.title`) : undefined;
  const asset = HERO_ASSET[page.id];

  const cta = (
    <>
      <ButtonLink href={site.links.app}>{t('common.tryNow')}</ButtonLink>
      <ButtonLink href={href('developers')} variant="outline">
        {t('common.getApi')}
      </ButtonLink>
    </>
  );

  switch (page.template) {
    case 'overview': {
      const kids = childrenOf(page.id);
      return (
        <>
          <PageHero eyebrow={eyebrow} title={title} desc={desc}>
            {cta}
          </PageHero>
          <section className="section-y">
            <ul className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kids.map((k) => (
                <li key={k.id}>
                  <Link
                    href={href(k.id)}
                    className="block h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-border-strong"
                  >
                    <p className="text-lg font-semibold">{t(`pages.${k.id}.title`)}</p>
                    <p className="mt-2 text-muted-foreground">{t(`pages.${k.id}.desc`)}</p>
                    <p className="mt-6 text-sm text-primary">{t('templates.overview.explore')} →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      );
    }
    case 'feature': {
      const steps = t.raw('templates.feature.steps') as string[];
      const specs = ['input', 'output', 'time', 'credits'] as const;
      const related = childrenOf('create')
        .filter((p) => p.id !== page.id)
        .slice(0, 3);
      return (
        <>
          <PageHero
            eyebrow={eyebrow}
            title={title}
            desc={desc}
            aside={asset && <StageCard asset={asset} label={title} />}
          >
            {cta}
          </PageHero>
          <section className="section-y">
            <div className="container-x">
              <SectionHeading title={t('templates.feature.howTitle')} />
              <ol className="mt-8 grid gap-4 md:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s}>
                    <Card>
                      <span className="font-display text-2xl font-semibold text-primary">
                        0{i + 1}
                      </span>
                      <p className="mt-3 font-medium">{s}</p>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>
          </section>
          <section className="section-y bg-card">
            <div className="container-x grid gap-10 lg:grid-cols-2">
              <SectionHeading title={t('templates.feature.specsTitle')} />
              <dl className="divide-y divide-border border-y border-border">
                {specs.map((k) => (
                  <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-4 text-sm">
                    <dt className="text-muted-foreground">{t(`templates.feature.specs.${k}`)}</dt>
                    <dd>{t(`templates.feature.specs.${k}Value`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <RelatedList title={t('templates.feature.relatedTitle')} items={related} t={t} />
        </>
      );
    }
    case 'usecase': {
      const steps = t.raw('templates.usecase.personalSteps') as string[];
      return (
        <>
          <PageHero
            eyebrow={eyebrow}
            title={title}
            desc={desc}
            aside={asset && <StageCard asset={asset} label={title} />}
          >
            {cta}
          </PageHero>
          <section className="section-y">
            <div className="container-x grid gap-10 lg:grid-cols-2">
              <div>
                <SectionHeading title={t('templates.usecase.personalTitle')} />
                <ol className="mt-6 space-y-3">
                  {steps.map((s, i) => (
                    <li key={s} className="flex gap-4 rounded-md border border-border bg-card p-4">
                      <span className="font-semibold text-primary">0{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <SectionHeading
                  title={t('templates.usecase.teamTitle')}
                  subtitle={t('templates.usecase.teamDesc')}
                />
                <div className="mt-6">
                  <CodeBlock
                    samples={quickstartSamples}
                    copyLabel={t('common.copy')}
                    copiedLabel={t('common.copied')}
                  />
                </div>
                <ButtonLink href="/contact" variant="outline" className="mt-6">
                  {t('common.contactSales')}
                </ButtonLink>
              </div>
            </div>
          </section>
          <RelatedList
            title={t('templates.usecase.relatedTitle')}
            items={childrenOf('create').slice(0, 3)}
            t={t}
          />
        </>
      );
    }
    case 'developer': {
      const nav = [pages.find((p) => p.id === 'developers')!, ...childrenOf('developers')];
      return (
        <>
          <PageHero eyebrow={eyebrow} title={title} desc={desc}>
            <ButtonLink href={site.links.console}>{t('common.getApi')}</ButtonLink>
            <ButtonLink href={site.links.docs} variant="outline">
              {t('common.viewDocs')}
            </ButtonLink>
          </PageHero>
          <section className="section-y">
            <div className="container-x grid gap-10 lg:grid-cols-[220px_1fr]">
              <nav aria-label={t('templates.developer.sidebarTitle')} className="min-w-0">
                <ul className="flex gap-1 overflow-x-auto lg:flex-col">
                  {nav.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={href(p.id)}
                        aria-current={p.id === page.id ? 'page' : undefined}
                        className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm ${p.id === page.id ? 'bg-secondary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {t(`pages.${p.id}.title`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="min-w-0">
                <SectionHeading title={t('templates.developer.codeTitle')} />
                <div className="mt-6">
                  <CodeBlock
                    samples={quickstartSamples}
                    copyLabel={t('common.copy')}
                    copiedLabel={t('common.copied')}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t('templates.developer.docsNote')}
                </p>
              </div>
            </div>
          </section>
        </>
      );
    }
    case 'tool':
      return (
        <PageHero eyebrow={eyebrow} title={title} desc={desc}>
          <Badge>{t('common.comingSoon')}</Badge>
          <p className="w-full text-sm text-muted-foreground">{t('templates.tool.desc')}</p>
        </PageHero>
      );
    default:
      return (
        <>
          <PageHero eyebrow={eyebrow} title={title} desc={desc} />
          <section className="section-y">
            <div className="container-x max-w-3xl">
              {page.id === 'technology' ? (
                <TechnologySections t={t} />
              ) : (
                <p className="leading-relaxed text-muted-foreground">
                  {t('templates.simple.body')}
                </p>
              )}
            </div>
          </section>
        </>
      );
  }
}

type T = Awaited<ReturnType<typeof getTranslations>>;

function RelatedList({ title, items, t }: { title: string; items: PageDef[]; t: T }) {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading title={title} />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={href(p.id)}
                className="block rounded-lg border border-border bg-card p-6 hover:border-border-strong"
              >
                <p className="font-semibold">{t(`pages.${p.id}.title`)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(`pages.${p.id}.desc`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TechnologySections({ t }: { t: T }) {
  const ids = ['materials', 'representations', 'data', 'benchmark', 'roadmap'] as const;
  return (
    <>
      <nav className="mb-10 flex flex-wrap gap-2">
        {ids.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {t(`technologySections.${id}`)}
          </a>
        ))}
      </nav>
      {ids.map((id) => (
        <section key={id} id={id} className="scroll-mt-24 border-t border-border py-10">
          <h2 className="font-display text-2xl font-semibold">{t(`technologySections.${id}`)}</h2>
          <p className="mt-3 text-muted-foreground">{t('templates.simple.body')}</p>
        </section>
      ))}
    </>
  );
}
