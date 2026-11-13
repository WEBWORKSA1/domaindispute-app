export const metadata = { title: 'UDRP Filing Procedure - DomainDispute' };

export default function UDRPPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Procedures</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">UDRP Filing Procedure</h1>
      <p className="text-lg text-muted mb-12">
        The Uniform Domain-Name Dispute-Resolution Policy (UDRP) is the standard process for resolving domain disputes outside of court. It applies to most gTLDs (.com, .net, .org, etc.) and is administered by approved providers like WIPO and Forum.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">When to use UDRP</h2>
          <p className="text-muted">UDRP is the right path when you allege bad-faith registration of a domain that infringes your trademark. It results in either domain transfer to the complainant, cancellation, or denial.</p>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">The 60-day timeline</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li><strong>Day 0:</strong> Complainant files complaint and pays provider fee</li>
            <li><strong>Days 1-3:</strong> Provider reviews complaint for compliance</li>
            <li><strong>Days 3-23:</strong> Respondent has 20 days to file response</li>
            <li><strong>Days 23-30:</strong> Provider appoints panelist(s)</li>
            <li><strong>Days 30-44:</strong> Panel deliberates</li>
            <li><strong>Day 60:</strong> Decision published</li>
            <li><strong>Day 70:</strong> Decision implemented (transfer, cancellation, or no action)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">What you must prove</h2>
          <p className="text-muted mb-3">Complainants must establish all three elements of <a href="/three-element-test" className="text-oxblood underline">the three-element test</a>:</p>
          <ol className="list-decimal pl-6 space-y-1 text-muted">
            <li>Identical or confusingly similar to a mark</li>
            <li>No rights or legitimate interests</li>
            <li>Registered and used in bad faith</li>
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Self-representation</h2>
          <p className="text-muted">Representation is optional. The UDRP Rules only ask for details of &ldquo;any representative authorized to act&rdquo; for a party (paragraphs 3(b)(ii) and 5(c)(ii)), and WIPO and Forum publish model complaint and response forms. Many complaints and responses are filed by the parties themselves. DomainDispute.com supports them with case research, guides and free tools.</p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-paper-warm border border-ink">
        <h3 className="font-serif font-black text-[20px] mb-3">Ready to assess your UDRP case?</h3>
        <p className="text-muted mb-6">Free Pre-Check walks through the three-element test against your facts in 60 seconds.</p>
        <a href="/start" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">Start Free Pre-Check &rarr;</a>
      </div>
    </div>
  );
}
