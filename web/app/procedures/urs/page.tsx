export const metadata = { title: 'URS Proceedings - DomainDispute' };

export default function URSPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Procedures</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">URS &mdash; Uniform Rapid Suspension</h1>
      <p className="text-lg text-muted mb-12">
        URS is a faster, lower-cost alternative to UDRP designed for clear-cut cases of trademark abuse. It results in domain suspension only &mdash; not transfer.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">When to use URS instead of UDRP</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Your case is clear and obvious (typosquatting, exact-match infringement)</li>
            <li>You only need to suspend the domain, not transfer it</li>
            <li>You want a fast, low-cost remedy</li>
            <li>Cost is a major concern (URS is ~$375-500 vs $1,500+ for UDRP)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">URS vs UDRP at a glance</h2>
          <div className="border border-ink">
            <table className="w-full text-sm">
              <thead className="bg-paper-warm">
                <tr><th className="text-left p-3">Feature</th><th className="text-left p-3">URS</th><th className="text-left p-3">UDRP</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-ink"><td className="p-3">Cost</td><td className="p-3">$375-500</td><td className="p-3">$1,500+</td></tr>
                <tr className="border-t border-ink"><td className="p-3">Timeline</td><td className="p-3">~3 weeks</td><td className="p-3">~60 days</td></tr>
                <tr className="border-t border-ink"><td className="p-3">Burden of proof</td><td className="p-3">Clear &amp; convincing</td><td className="p-3">Preponderance</td></tr>
                <tr className="border-t border-ink"><td className="p-3">Outcome</td><td className="p-3">Suspension only</td><td className="p-3">Transfer or cancellation</td></tr>
                <tr className="border-t border-ink"><td className="p-3">Applies to</td><td className="p-3">New gTLDs (mostly)</td><td className="p-3">All gTLDs</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Higher burden of proof</h2>
          <p className="text-muted">URS requires clear and convincing evidence &mdash; a higher standard than UDRP. The case must be obvious enough that no reasonable panel would disagree. If your case has nuance, UDRP is usually the better path.</p>
        </section>
      </div>
    </div>
  );
}
