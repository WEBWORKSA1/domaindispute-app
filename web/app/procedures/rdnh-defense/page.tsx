export const metadata = { title: 'RDNH Defense - DomainDispute' };

export default function RDNHPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Procedures</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">RDNH &mdash; Reverse Domain Name Hijacking</h1>
      <p className="text-lg text-muted mb-12">
        Reverse Domain Name Hijacking (RDNH) is when a complainant files a UDRP in bad faith &mdash; trying to use the process to grab a domain they have no legitimate claim to. As a respondent, asserting RDNH is one of your strongest defenses.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">What counts as RDNH</h2>
          <p className="text-muted mb-3">UDRP Rule 15(e) defines RDNH as filing a complaint &ldquo;in bad faith, in an attempt to deprive a registered domain-name holder of a domain name.&rdquo; Common patterns:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Complainant knew or should have known their case had no merit</li>
            <li>Complainant&apos;s trademark post-dates the domain registration</li>
            <li>Complainant offered to buy the domain, was refused, then filed UDRP</li>
            <li>Plan B filings &mdash; using UDRP after a failed acquisition negotiation</li>
            <li>Complainant misrepresented facts to the panel</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Why it matters</h2>
          <p className="text-muted">An RDNH finding is a public record that the complainant abused the UDRP process. It creates real reputational damage and can be cited in future disputes. While there's no monetary award in UDRP, an RDNH finding is the strongest possible respondent victory.</p>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">How to assert RDNH in your response</h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted">
            <li>Document the registration timeline (your domain predates their trademark)</li>
            <li>Show evidence of the complainant&apos;s knowledge or recklessness</li>
            <li>Demonstrate any prior negotiation attempts (especially Plan B patterns)</li>
            <li>Cite past panel decisions finding RDNH on similar facts</li>
            <li>Explicitly request an RDNH finding in your response</li>
          </ol>
        </section>
      </div>

      <div className="mt-16 p-8 bg-paper-warm border border-ink">
        <h3 className="font-serif font-black text-[20px] mb-3">Facing a UDRP complaint?</h3>
        <p className="text-muted mb-6">Our Pre-Check identifies whether your case has RDNH potential and which past decisions support your defense.</p>
        <a href="/start" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">Start Free Pre-Check &rarr;</a>
      </div>
    </div>
  );
}
