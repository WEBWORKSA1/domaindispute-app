export const metadata = { title: 'ccTLD Disputes - DomainDispute' };

export default function CcTLDPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Procedures</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">ccTLD Disputes</h1>
      <p className="text-lg text-muted mb-12">
        Country code top-level domains (ccTLDs) like .uk, .ca, .de, .fr, .au, .in have their own dispute resolution policies &mdash; usually similar to UDRP but with key local differences. Each ccTLD requires familiarity with its specific rules.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">Major ccTLD policies</h2>
          <div className="space-y-4 text-muted">
            <div><strong>.uk (Nominet DRS)</strong> &mdash; Two-element test: identical/similar + abusive registration. More respondent-friendly than UDRP.</div>
            <div><strong>.ca (CIRA CDRP)</strong> &mdash; Canadian Presence Requirement: respondent must be Canadian (or face transfer). Three-element test similar to UDRP.</div>
            <div><strong>.de (DENIC)</strong> &mdash; Court-only resolution. No administrative dispute process. Disputes go to German courts.</div>
            <div><strong>.fr (AFNIC)</strong> &mdash; SYRELI procedure or court. Two-element test under SYRELI.</div>
            <div><strong>.au (auDRP)</strong> &mdash; Eligibility-based: must demonstrate Australian connection. Three-element test similar to UDRP.</div>
            <div><strong>.in (INDRP)</strong> &mdash; Three-element test very similar to UDRP. Administered by NIXI.</div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Why ccTLDs are harder than gTLDs</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Local language requirements (some ccTLDs require submissions in the local language)</li>
            <li>Local presence rules (some require respondent to be a national/resident)</li>
            <li>Smaller case databases for pattern matching</li>
            <li>Country-specific legal frameworks layered on top of dispute rules</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Self-representation feasibility</h2>
          <p className="text-muted">For English-language ccTLDs (.uk, .ca, .au, .in) self-representation is generally feasible. For non-English ccTLDs, professional representation in the local language is usually advisable. DomainDispute&apos;s Pre-Check supports gTLD UDRP cases primarily; ccTLD cases require additional research.</p>
        </section>
      </div>
    </div>
  );
}
