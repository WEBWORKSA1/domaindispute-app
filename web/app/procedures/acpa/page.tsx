export const metadata = { title: 'ACPA Litigation - DomainDispute' };

export default function ACPAPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Procedures</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">ACPA &mdash; Anticybersquatting Consumer Protection Act</h1>
      <p className="text-lg text-muted mb-12">
        ACPA is a U.S. federal statute (15 U.S.C. &sect; 1125(d)) that allows trademark owners to sue cybersquatters in federal court. Unlike UDRP, ACPA awards monetary damages in addition to domain transfer.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">When to use ACPA instead of UDRP</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>You want monetary damages (up to $100,000 per domain in statutory damages)</li>
            <li>The respondent is in the U.S. and has assets to recover</li>
            <li>The case involves multiple bad acts beyond domain registration</li>
            <li>You need broader injunctive relief</li>
            <li>UDRP failed and you want to pursue further</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Cost &amp; complexity</h2>
          <p className="text-muted">ACPA is real federal litigation. Expect $20,000-$200,000+ in legal costs. Cases run 12-24 months. <strong>This is not a self-help process.</strong> If you're considering ACPA, you should consult a qualified trademark litigator. DomainDispute does not support ACPA filings.</p>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">In rem actions</h2>
          <p className="text-muted">If you can't locate the respondent (anonymous registration, foreign respondent), ACPA allows in rem actions against the domain itself. The case is filed where the domain registry is located (typically Virginia for .com).</p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-paper-warm border border-ink">
        <h3 className="font-serif font-black text-[20px] mb-3">Try UDRP first.</h3>
        <p className="text-muted mb-6">For most cases, UDRP is faster, cheaper, and sufficient. ACPA is the heavy artillery &mdash; reserve it for when UDRP can't deliver the remedy you need.</p>
        <a href="/procedures/udrp" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">UDRP Procedure &rarr;</a>
      </div>
    </div>
  );
}
