'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const KEY = 'dd-cookie-notice-v1';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked: stay hidden */
    }
  }, []);

  function close(choice: 'accepted' | 'essential') {
    try {
      window.localStorage.setItem(KEY, choice);
    } catch {
      /* ignore */
    }
    if (choice === 'essential') {
      // Ask Google to serve non-personalised ads for this visitor.
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      ((window as unknown as { adsbygoogle: { requestNonPersonalizedAds?: number } }).adsbygoogle).requestNonPersonalizedAds = 1;
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <div className="rounded-lg border border-bone-2 bg-paper p-4 shadow-[0_10px_30px_rgba(18,35,59,0.18)]">
        <p className="text-sm leading-relaxed text-ink-soft">
          We use cookies to run the site and to show ads from Google, which may use cookies to personalise ads. Read our{' '}
          <Link href="/legal/cookies" className="link">
            cookie policy
          </Link>
          .
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => close('accepted')} className="btn-dark flex-1 px-3 py-2 text-sm">
            Accept all
          </button>
          <button type="button" onClick={() => close('essential')} className="btn-outline flex-1 px-3 py-2 text-sm">
            Non-personalised ads only
          </button>
        </div>
      </div>
    </div>
  );
}
