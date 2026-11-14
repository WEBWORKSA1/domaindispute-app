export const metadata = { title: 'The Three-Element Test - DomainsDispute' };

export default function ThreeElementTestPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">UDRP Foundation</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">The Three-Element Test</h1>
      <p className="text-lg text-muted mb-12">
        Every UDRP complaint must establish all three of these elements. Missing any one means the complaint fails. Understanding this test is the foundation of every domain dispute strategy — whether you're filing or responding.
      </p>

      <div className="space-y-12">
        <div className="border-l-4 border-oxblood pl-6">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Element 1</span>
          <h2 className="font-serif font-black text-[28px] mt-2 mb-4">Identical or confusingly similar to a trademark</h2>
          <p className="text-muted mb-4">
            The complainant must own a trademark (registered or common-law) that the disputed domain is identical to, or confusingly similar to. The TLD (.com, .net, etc.) is generally disregarded.
          </p>
          <p className="text-sm text-muted">
            Common patterns: typosquatting (goggle.com vs google.com), homograph attacks, brand + descriptor (apple-store.com).
          </p>
        </div>

        <div className="border-l-4 border-oxblood pl-6">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Element 2</span>
          <h2 className="font-serif font-black text-[28px] mt-2 mb-4">No rights or legitimate interests</h2>
          <p className="text-muted mb-4">
            The complainant must show the respondent has no rights or legitimate interests in the domain. Legitimate interests include: bona fide commercial use, being commonly known by the name, or non-commercial fair use.
          </p>
          <p className="text-sm text-muted">
            Common defenses: prior use predating the trademark, descriptive/generic words, fan sites, criticism sites, planned business.
          </p>
        </div>

        <div className="border-l-4 border-oxblood pl-6">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Element 3</span>
          <h2 className="font-serif font-black text-[28px] mt-2 mb-4">Registered and used in bad faith</h2>
          <p className="text-muted mb-4">
            Both registration and use must be in bad faith. Examples include: registering to sell to the trademark owner at a premium, blocking the trademark owner from registering, disrupting a competitor, or attracting users by creating confusion.
          </p>
          <p className="text-sm text-muted">
            Defenses: registration predates trademark, no knowledge of the trademark, fair commercial use, free speech.
          </p>
        </div>
      </div>

      <div className="mt-16 p-8 bg-paper-warm border border-ink">
        <h3 className="font-serif font-black text-[20px] mb-3">Want to know how your case stacks up?</h3>
        <p className="text-muted mb-6">Our free Pre-Check walks through all three elements with your specific facts and tells you which past cases look most similar.</p>
        <a href="/start" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">
          Start Free Pre-Check &rarr;
        </a>
      </div>
    </div>
  );
}
