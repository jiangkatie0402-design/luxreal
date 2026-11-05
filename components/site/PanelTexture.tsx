'use client';
import { useId } from 'react';
import { GaussMesh } from '@/components/home/viewport/GaussMesh';

/**
 * Background texture for a use-case panel.
 * - film: crinkled plastic-film sheen, generated with SVG lighting filters
 * - mesh: the live Gaussian wireframe used on the cover
 */
export function PanelTexture({
  kind,
  dark,
  seed,
  mesh,
}: {
  kind: 'film' | 'mesh';
  dark: boolean;
  seed: number;
  mesh: [string, string];
}) {
  const id = useId().replace(/:/g, '');
  if (kind === 'mesh')
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${dark ? 'opacity-90' : 'opacity-70'}`}
        style={{ transform: 'translateY(-22%) scale(1.15)' }}
      >
        <GaussMesh from={mesh[0]} to={mesh[1]} />
      </div>
    );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* folds: diffuse shading (shadows) + specular sheen (highlights) from one noise field */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <filter id={`fold-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0018 0.0045"
            numOctaves="4"
            seed={seed}
            result="n"
          />
          <feDiffuseLighting in="n" surfaceScale="9" diffuseConstant="1.1" lightingColor="#ffffff">
            <feDistantLight azimuth="235" elevation="42" />
          </feDiffuseLighting>
        </filter>
        <filter id={`sheen-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0018 0.0045"
            numOctaves="4"
            seed={seed}
            result="n"
          />
          <feSpecularLighting
            in="n"
            surfaceScale="9"
            specularConstant="1.2"
            specularExponent="28"
            lightingColor="#ffffff"
            result="spec"
          >
            <feDistantLight azimuth="235" elevation="42" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceGraphic" operator="in" />
        </filter>
        <rect
          width="100%"
          height="100%"
          fill="#fff"
          filter={`url(#fold-${id})`}
          style={{ mixBlendMode: 'multiply', opacity: dark ? 0.55 : 0.42 }}
        />
        <rect
          width="100%"
          height="100%"
          fill="#fff"
          filter={`url(#sheen-${id})`}
          style={{ mixBlendMode: 'screen', opacity: dark ? 0.32 : 0.75 }}
        />
      </svg>
      {/* creases: a few long diagonal highlights */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.22) 20%, transparent 23%), linear-gradient(62deg, transparent 52%, rgba(255,255,255,0.16) 54%, transparent 57%), linear-gradient(140deg, transparent 70%, rgba(255,255,255,0.12) 72%, transparent 75%)',
          mixBlendMode: dark ? 'screen' : 'soft-light',
          opacity: dark ? 0.35 : 0.9,
        }}
      />
    </div>
  );
}
