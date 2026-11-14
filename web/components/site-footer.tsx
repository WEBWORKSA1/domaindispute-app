import Link from 'next/link';
import { FOOTER_GROUPS, SITE } from '@/lib/site';
import { EmailSignup } from '@/components/email-signup';
import { Logo } from '@/components/logo';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="wrap grid gap-10 border-b border-white/10 py-12 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="font-serif text-xl font-bold">DomainsDispute.com</span>
          </Link>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
            Free research and guidance for anyone filing or answering a domain name dispute. Updated automatically every day from public provider records.
          </p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-semibold">Get the daily brief</p>
            <EmailSignup variant="dark" compact />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 text-sm font-semibold text-white">{group.title}</h2>
              <ul className="space-y-2">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-white/70 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap space-y-3 py-8 text-[13px] leading-relaxed text-white/60">
        <p>
          <strong className="text-white/85">Not a law firm.</strong> DomainsDispute.com provides general legal information, public case data and self-help tools. Nothing on this site is legal advice, and using it does not create an attorney-client relationship. For advice on your situation, consult a qualified lawyer.
        </p>
        <p>
          &copy; {SITE.foundedYear === year ? year : `${SITE.foundedYear}-${year}`} DomainsDispute.com. All rights reserved. &ldquo;DomainsDispute&rdquo; and the DomainsDispute.com name and logo are trademarks of their owner. WIPO, ICANN, Forum, UDRP and other names are trademarks of their respective owners, used here only to identify them; no affiliation or endorsement is implied. Case records are drawn from public provider databases. See{' '}
          <Link href="/legal/copyright" className="underline hover:text-white">
            trademark &amp; copyright
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
