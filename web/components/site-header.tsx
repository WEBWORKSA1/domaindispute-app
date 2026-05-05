import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SiteHeader({ className }: { className?: string }) {
  return (
    <>
      {/* Top classified banner */}
      <div className="bg-ink text-bone border-b-[3px] border-double border-gold">
        <div className="max-w-[1320px] mx-auto px-8 py-2 flex justify-between items-center gap-5 font-mono text-[10px] tracking-[0.12em] uppercase">
          <span className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-bright animate-pulse-slow" />
            Self-help platform &middot; UDRP, URS &amp; ccTLD case prep &middot; Tiered SaaS &middot; ICANN &para; 4(b) self-representation
          </span>
          <span className="hidden md:inline">Free Pre-Check &middot; Sixty seconds &middot; No obligation</span>
          <Link href="/start" className="text-bone hover:opacity-100 opacity-75">
            Start Free Pre-Check &rarr;
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-ink',
          className,
        )}
      >
        <div className="max-w-[1320px] mx-auto px-8 py-[18px] flex justify-between items-center">
          <Link href="/" className="flex items-baseline gap-3 text-ink no-underline">
            <span className="font-serif font-black text-[26px] tracking-tight">
              DomainDispute<span className="text-oxblood">.</span>
            </span>
            <span className="hidden lg:inline text-[10px] tracking-[0.22em] uppercase text-muted font-medium border-l border-muted pl-3">
              Self-Help Platform &middot; Not a Law Firm
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/patterns" className="text-[13px] font-medium hover:text-oxblood">
              Patterns
            </Link>
            <Link href="/cases" className="text-[13px] font-medium hover:text-oxblood">
              Case Library
            </Link>
            <Link href="/live" className="text-[13px] font-medium hover:text-oxblood flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-oxblood animate-pulse-slow" />
              Live Feed
            </Link>
            <Link
              href="/start"
              className="bg-oxblood text-bone px-5 py-2.5 font-semibold text-[13px] border border-oxblood hover:bg-oxblood-deep transition"
            >
              Start Free Pre-Check
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
