'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV } from '@/lib/site';

const EXTRA = [
  { href: '/brief', label: 'Daily brief' },
  { href: '/patterns', label: 'Dispute patterns' },
  { href: '/start', label: 'Free pre-check' },
  { href: '/support', label: 'Support the project' },
  { href: '/contests', label: 'Contests' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/contact', label: 'Contact' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-bone-2 text-ink hover:bg-bone"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-bone-2 bg-paper">
          <nav aria-label="Mobile" className="wrap py-4">
            <ul className="divide-y divide-bone-2">
              {[...NAV, ...EXTRA].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block py-3.5 text-[17px] font-medium text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/get-help" className="btn-primary mt-6 w-full">
              Get a free case review
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
