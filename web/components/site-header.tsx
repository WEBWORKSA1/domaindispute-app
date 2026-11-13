import Link from 'next/link';
import { NAV } from '@/lib/site';
import { MobileNav } from '@/components/mobile-nav';
import { Logo } from '@/components/logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-bone-2 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-ink" aria-label="DomainDispute.com home">
          <Logo className="h-8 w-8" />
          <span className="font-serif text-[21px] font-bold tracking-tight">
            DomainDispute<span className="text-oxblood">.com</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft hover:bg-bone hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/get-help" className="btn-primary hidden px-4 py-2.5 text-sm sm:inline-flex">
            Free case review
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
