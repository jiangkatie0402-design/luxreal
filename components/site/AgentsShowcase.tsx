'use client';
import { useTranslations } from 'next-intl';
import {
  Boxes,
  ClipboardCheck,
  CloudUpload,
  GraduationCap,
  ListTree,
  type LucideIcon,
} from 'lucide-react';
import { Mascot } from './Mascot';

const ICONS: LucideIcon[] = [Boxes, ClipboardCheck, ListTree, CloudUpload, GraduationCap];

/**
 * "Built for agents": copy on the left, the mascot framed on a dotted stage on the right,
 * then a row of five capability cells.
 */
export function AgentsShowcase() {
  const t = useTranslations('site.agents');
  const items = t.raw('items') as { t: string; d: string }[];
  return (
    <div className="agx">
      <div className="agx-hero">
        <div className="agx-copy">
          <p className="agx-eyebrow">{t('eyebrow')}</p>
          <h2 id="agents-title" className="t-h2">
            {t('titleA')}
            <em>{t('titleB')}</em>
          </h2>
          <p className="agx-lead">{t('lead')}</p>
        </div>
        <div className="agx-stage" aria-hidden>
          <div className="agx-frame">
            <i />
            <i />
            <i />
            <i />
            <span className="agx-scan" />
          </div>
          <div className="agx-mascot">
            <Mascot className="absolute inset-0" />
          </div>
        </div>
      </div>
      <div className="agx-cells">
        {items.map((it, i) => {
          const Icon = ICONS[i];
          return (
            <div key={it.t} className="agx-cell">
              <div className="agx-top">
                <span className="agx-n">0{i + 1}</span>
                <span className="agx-ic">
                  <Icon strokeWidth={1.6} aria-hidden />
                </span>
              </div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
