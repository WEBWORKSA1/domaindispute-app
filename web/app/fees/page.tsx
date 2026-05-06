export const metadata = { title: 'Provider Fees - DomainDispute' };

export default function FeesPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Provider Fees</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">Filing fees by provider</h1>
      <p className="text-lg text-muted max-w-2xl mb-12">
        These are the fees the dispute resolution provider charges — separate from any DomainDispute service tier. Most fees are paid by the complainant; respondents typically pay only if they elect a 3-member panel.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-ink p-8">
          <h2 className="font-serif font-black text-[24px] mb-2">WIPO (UDRP)</h2>
          <p className="text-sm text-muted mb-6">World Intellectual Property Organization</p>
          <ul className="space-y-2 text-sm">
            <li>1 panelist, 1–5 domains: <strong>USD 1,500</strong></li>
            <li>1 panelist, 6–10 domains: <strong>USD 2,000</strong></li>
            <li>3 panelists, 1–5 domains: <strong>USD 4,000</strong></li>
            <li>3 panelists, 6–10 domains: <strong>USD 5,000</strong></li>
          </ul>
          <p className="text-xs text-muted mt-6">Verify current schedule at wipo.int/amc/en/domains/fees before filing.</p>
        </div>

        <div className="border border-ink p-8">
          <h2 className="font-serif font-black text-[24px] mb-2">Forum (UDRP)</h2>
          <p className="text-sm text-muted mb-6">National Arbitration Forum</p>
          <ul className="space-y-2 text-sm">
            <li>1 panelist, 1–2 domains: <strong>USD 1,300</strong></li>
            <li>1 panelist, 3–5 domains: <strong>USD 1,450</strong></li>
            <li>3 panelists, 1–2 domains: <strong>USD 2,600</strong></li>
            <li>3 panelists, 3–5 domains: <strong>USD 3,500</strong></li>
          </ul>
          <p className="text-xs text-muted mt-6">Verify current schedule at adrforum.com before filing.</p>
        </div>

        <div className="border border-ink p-8">
          <h2 className="font-serif font-black text-[24px] mb-2">URS (Uniform Rapid Suspension)</h2>
          <p className="text-sm text-muted mb-6">Faster, lower-cost alternative for clear-cut cases</p>
          <ul className="space-y-2 text-sm">
            <li>1–14 domains: <strong>USD 375–500</strong></li>
            <li>15+ domains: <strong>USD 500+</strong></li>
          </ul>
          <p className="text-xs text-muted mt-6">Suspends the domain only — does not transfer ownership. Different remedy than UDRP.</p>
        </div>

        <div className="border border-ink p-8">
          <h2 className="font-serif font-black text-[24px] mb-2">CAC (UDRP)</h2>
          <p className="text-sm text-muted mb-6">Czech Arbitration Court</p>
          <ul className="space-y-2 text-sm">
            <li>1 panelist, 1–5 domains: <strong>EUR 800</strong></li>
            <li>3 panelists, 1–5 domains: <strong>EUR 2,200</strong></li>
          </ul>
          <p className="text-xs text-muted mt-6">European-favored. Verify at adr.eu before filing.</p>
        </div>
      </div>

      <p className="text-sm text-muted mt-12 max-w-2xl italic">
        These figures are reference estimates. Always confirm the live fee schedule on the provider's website on the day you file. Currency conversions and special rules may apply.
      </p>
    </div>
  );
}
