'use client';
import { View } from '@react-three/drei';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { RigPreview } from '@/components/three/RigPreview';
import { ShowcaseModel, ShowcaseRig } from '@/components/three/ShowcaseModel';
import { useViews3d } from '@/components/three/ViewCanvas';
import type { FeatureTab } from '@/config/features';
import { thumbSrc } from '@/config/gallery';

/** Coded stand-in for a workspace screenshot: input panel + settings + live output. */
export function WorkspaceMock({ tab }: { tab: FeatureTab }) {
  const t = useTranslations('home.features');
  const can3d = useViews3d();

  if (tab.screenshot) {
    return (
      <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-border">
        <Image src={tab.screenshot} alt={t(`tabs.${tab.id}.title`)} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-md border border-border-strong bg-background shadow-card"
      role="img"
      aria-label={t('mockLabel', { feature: t(`tabs.${tab.id}.title`) })}
    >
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
        </span>
        <span className="truncate rounded bg-secondary px-3 py-1 font-mono text-xs text-subtle">
          app.lux3d / workspace
        </span>
      </div>
      <div className="grid md:grid-cols-[190px_1fr]">
        {/* settings panel */}
        <div className="flex flex-col gap-3 border-b border-border bg-card p-3 text-xs md:border-b-0 md:border-r">
          <p className="font-medium text-muted-foreground">{t(`input.${tab.input.kind}`)}</p>
          <InputSlot tab={tab} />
          <Setting
            label={t('settings.version')}
            options={[t('settings.standard'), t('settings.turbo')]}
          />
          {tab.input.kind === 'rig' ? (
            <Setting
              label={t('settings.motion')}
              options={[t('settings.walk'), t('settings.idle'), t('settings.jump')]}
            />
          ) : (
            <Setting label={t('settings.output')} options={['Mesh', 'PBR', '3DGS']} active={1} />
          )}
          <span className="mt-1 rounded-full bg-primary py-1.5 text-center font-medium text-primary-foreground">
            {t('settings.generate')}
          </span>
        </div>
        {/* viewport */}
        <div className="relative aspect-[4/3] min-h-[240px] bg-[radial-gradient(70%_60%_at_50%_55%,var(--color-surface-2),var(--color-bg))] md:aspect-auto">
          {can3d ? (
            <View className="absolute inset-0">
              <ShowcaseRig>
                {tab.input.kind === 'rig' ? (
                  <RigPreview />
                ) : (
                  <ShowcaseModel asset={tab.output} yaw={-0.6} />
                )}
              </ShowcaseRig>
            </View>
          ) : (
            <Image
              src={thumbSrc(tab.outputThumb)}
              alt=""
              fill
              sizes="480px"
              className="object-contain p-6"
            />
          )}
          <span className="absolute bottom-3 left-3 z-30 rounded-full border border-border bg-card/85 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {tab.stats}
          </span>
        </div>
      </div>
    </div>
  );
}

function InputSlot({ tab }: { tab: FeatureTab }) {
  const t = useTranslations('home.features');
  const input = tab.input;
  if (input.kind === 'image')
    return (
      <div className="relative aspect-square overflow-hidden rounded border border-dashed border-primary/60 bg-secondary">
        <Image
          src={thumbSrc(input.thumb)}
          alt=""
          fill
          sizes="190px"
          className="object-contain p-2"
        />
      </div>
    );
  if (input.kind === 'views')
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {input.thumbs.map((k) => (
          <div
            key={k}
            className="relative aspect-square overflow-hidden rounded border border-border bg-secondary"
          >
            <Image src={thumbSrc(k)} alt="" fill sizes="90px" className="object-contain p-1" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="flex items-center gap-2 rounded border border-border bg-secondary p-2">
      <div className="relative size-12 shrink-0">
        <Image
          src={thumbSrc('gallery-corgi')}
          alt=""
          fill
          sizes="48px"
          className="object-contain"
        />
      </div>
      <span className="text-muted-foreground">{t('rigSource')}</span>
    </div>
  );
}

function Setting({
  label,
  options,
  active = 0,
}: {
  label: string;
  options: string[];
  active?: number;
}) {
  return (
    <div>
      <p className="mb-1.5 text-subtle">{label}</p>
      <div className="flex rounded-full bg-secondary p-0.5">
        {options.map((o, i) => (
          <span
            key={o}
            className={`flex-1 rounded-full py-1 text-center ${i === active ? 'bg-background text-foreground' : 'text-subtle'}`}
          >
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}
