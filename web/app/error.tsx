'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="wrap py-20">
      <h1 className="h-display text-display-sm">This page could not load</h1>
      <p className="mt-3 max-w-xl text-[17px] text-ink-soft">
        The case database did not respond in time. Try again; if it keeps happening, the data is refreshing and will be back within minutes.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-dark">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go to the home page
        </Link>
      </div>
    </section>
  );
}
