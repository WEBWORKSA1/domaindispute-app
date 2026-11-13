'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const HIDE_ON = ['/get-help', '/contact', '/support', '/careers', '/advertise', '/contests', '/start', '/legal'];
const KEY = 'dd-sticky-cta-closed';

/** Slim bottom bar inviting a free case review, shown after the reader scrolls. */
export function StickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    try {
      setClosed(window.sessionStorage.getItem(KEY) === '1');
    } catch {
      setClosed(false);
    }
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (closed || !visible || HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bone-2 bg-paper/95 backdrop-blur">
      <div className="wrap flex items-center gap-3 py-2.5">
        <p className="flex-1 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Received a UDRP complaint?</span>
          <span className="hidden sm:inline"> You usually have 20 days to respond. Get a free case review.</span>
        </p>
        <Link href="/get-help" className="btn-primary shrink-0 px-4 py-2 text-sm">
          Free review
        </Link>
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            try {
              window.sessionStorage.setItem(KEY, '1');
            } catch {
              /* ignore */
            }
          }}
          className="shrink-0 rounded p-1.5 text-muted hover:bg-bone hover:text-ink"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
