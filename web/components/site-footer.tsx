import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone px-8 pt-20 pb-8">
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-bone-2">
          <div>
            <Link href="/" className="flex items-baseline gap-3 text-bone no-underline mb-4">
              <span className="font-serif font-black text-2xl tracking-tight">
                DomainDispute<span className="text-gold-bright">.</span>
              </span>
            </Link>
            <p className="text-sm text-bone-2 max-w-sm leading-relaxed">
              Self-help research and document-preparation platform for UDRP, URS, ACPA, and ccTLD
              dispute self-representation. Not a law firm. Built around the codified right of pro se
              representation.
            </p>
          </div>

          <FooterCol title="Procedures">
            <FooterLink href="/procedures/udrp">UDRP Filing</FooterLink>
            <FooterLink href="/procedures/urs">URS Proceedings</FooterLink>
            <FooterLink href="/procedures/acpa">ACPA Litigation</FooterLink>
            <FooterLink href="/procedures/rdnh-defense">RDNH Defense</FooterLink>
            <FooterLink href="/procedures/cctld">ccTLD Disputes</FooterLink>
          </FooterCol>

          <FooterCol title="Resources">
            <FooterLink href="/resources/self-representation-guide">Self-Representation Guide</FooterLink>
            <FooterLink href="/cases">Case Library</FooterLink>
            <FooterLink href="/live">Live Feed</FooterLink>
            <FooterLink href="/three-element-test">Three-Element Test</FooterLink>
            <FooterLink href="/fees">Provider Fees</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="https://www.icann.org/resources/pages/policy-2024-02-21-en" external>
              ICANN UDRP Policy &uarr;
            </FooterLink>
          </FooterCol>

          <FooterCol title="Account">
            <FooterLink href="/start">Free Pre-Check</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
            <FooterLink href="mailto:hello@domaindispute.com">hello@domaindispute.com</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between gap-5 text-xs text-bone-2">
          <span>&copy; 2026 DomainDispute.com &middot; Self-help platform for domain dispute self-representation.</span>
          <span className="italic max-w-3xl leading-relaxed">
            DomainDispute.com is a self-help research and document-preparation platform - not a law firm.
            UDRP Rules section 4(b), URS Procedure section 1.2.6, and the supplemental rules of every ICANN-approved provider
            expressly permit self-representation. We do not provide legal advice, do not establish an
            attorney-client relationship, and do not file or submit documents on your behalf. You are solely
            responsible for the accuracy of facts you submit, for reviewing every document we prepare, and for
            the legal consequences of any filing.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] tracking-[0.22em] uppercase text-gold-bright mb-5 font-medium">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-bone-2 text-sm hover:text-bone no-underline"
        {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      >
        {children}
      </Link>
    </li>
  );
}
