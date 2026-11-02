'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef, useState, type CSSProperties } from 'react';

const SRC = '/core/corgi-model-cut.webp';

/** Low Poly: drag the divider between the low-poly wireframe and the finished asset. */
export function LowPoly() {
  const t = useTranslations('home.scenes.game.lowpoly');
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setX(Math.min(92, Math.max(8, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="absolute inset-0 cursor-ew-resize select-none touch-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <div className="absolute inset-x-[8%] bottom-[12%] top-[10%]">
        {/* low-poly wireframe on the left */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
          <Image
            src={SRC}
            alt=""
            fill
            sizes="420px"
            className="object-contain [filter:grayscale(1)_brightness(1.45)_contrast(0.8)]"
          />
          <div
            className="absolute inset-0 [background:repeating-linear-gradient(35deg,rgba(40,50,80,0.55)_0_1px,transparent_1px_16px),repeating-linear-gradient(-35deg,rgba(40,50,80,0.55)_0_1px,transparent_1px_16px)] [mask-image:var(--m)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
            style={{ '--m': `url(${SRC})` } as CSSProperties}
          />
        </div>
        {/* finished asset on the right */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${x}%)` }}>
          <Image src={SRC} alt="" fill sizes="420px" className="object-contain" />
        </div>
      </div>
      <div className="absolute inset-y-0 w-px bg-white/80" style={{ left: `${x}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-9 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs text-[#07112a] shadow-lg">
          ‹ ›
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
        {t('low')}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
        {t('high')}
      </span>
    </div>
  );
}
