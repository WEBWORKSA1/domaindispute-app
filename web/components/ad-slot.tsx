'use client';

import { useEffect, useRef } from 'react';
import { SITE } from '@/lib/site';

/**
 * Manual AdSense unit. Renders nothing until a slot ID is configured
 * (NEXT_PUBLIC_ADSENSE_SLOT_<NAME>); until then Auto ads fill the page.
 * Placed only between content blocks, never next to buttons or forms.
 */
const SLOTS: Record<string, string | undefined> = {
  inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
};

export function AdSlot({ name = 'inline', className }: { name?: keyof typeof SLOTS; className?: string }) {
  const slot = SLOTS[name];
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!slot || !ref.current || ref.current.dataset.loaded) return;
    try {
      ref.current.dataset.loaded = '1';
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* ad blockers */
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-1 text-center text-[11px] text-muted-2">Advertisement</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={SITE.adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
