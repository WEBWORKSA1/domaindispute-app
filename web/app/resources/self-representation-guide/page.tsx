export const metadata = { title: 'Self-Representation Guide - DomainsDispute' };

export default function SelfRepGuidePage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Resources</span>
      <h1 className="font-serif font-black text-[44px] tracking-tight mt-4 mb-6">The Self-Representation Guide</h1>
      <p className="text-lg text-muted mb-12">
        Nothing in the UDRP requires a lawyer: the Rules only ask for details of &ldquo;any representative authorized to act&rdquo; for a party. Many complaints and responses are filed by the parties themselves every year. Here&apos;s how to do it well.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-serif text-[26px] mb-4">When self-representation makes sense</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Your case is factually clear (clear typosquatting, clear legitimate use)</li>
            <li>The financial stakes don&apos;t justify $5,000-50,000 in legal fees</li>
            <li>You can articulate your facts clearly in writing</li>
            <li>You have time to do thorough research</li>
            <li>You&apos;re comfortable with a written-only process (no oral argument in UDRP)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">When you should hire counsel</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>The domain has substantial business value ($50K+)</li>
            <li>Multiple domains in dispute</li>
            <li>Counterclaims for damages anticipated (ACPA)</li>
            <li>Criminal allegations involved</li>
            <li>You don&apos;t have time to research thoroughly</li>
            <li>The case has unusual jurisdictional complexity</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">The 6-step self-representation playbook</h2>
          <ol className="list-decimal pl-6 space-y-3 text-muted">
            <li><strong>Assess your case strength.</strong> Use our free Pre-Check or run through <a href="/three-element-test" className="text-oxblood underline">the three-element test</a> yourself.</li>
            <li><strong>Research similar cases.</strong> Browse our <a href="/cases" className="text-oxblood underline">Case Library</a> for decisions on similar facts. Note which patterns the panel found persuasive.</li>
            <li><strong>Identify your strongest argument.</strong> If you&apos;re a respondent, that&apos;s usually your legitimate interest or pre-existing rights. If you&apos;re a complainant, that&apos;s usually your trademark strength + the respondent&apos;s bad faith pattern.</li>
            <li><strong>Gather evidence.</strong> Domain registration date (WHOIS history at DomainTools or similar), trademark registrations, prior negotiations (emails), website screenshots over time (Wayback Machine).</li>
            <li><strong>Write your submission.</strong> Stick to facts. Cite the rule and case precedents. Be concise &mdash; panels read hundreds of submissions and reward clarity.</li>
            <li><strong>Submit on time.</strong> Respondents have 20 days. Missing the deadline almost always loses the case by default.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-[26px] mb-4">Common self-representation mistakes</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Emotional language &mdash; panels respond to facts, not anger</li>
            <li>Burying the strongest argument in a long submission</li>
            <li>Failing to cite the actual UDRP rules and policy</li>
            <li>Not addressing the complainant&apos;s strongest argument</li>
            <li>Ignoring the case-law tradition (panels reference past decisions)</li>
            <li>Missing the 20-day response deadline</li>
          </ul>
        </section>
      </div>

      <div className="mt-16 p-8 bg-paper-warm border border-ink">
        <h3 className="font-serif font-black text-[20px] mb-3">Get personalized assessment</h3>
        <p className="text-muted mb-6">Free Pre-Check tells you your case strength and which patterns from past decisions support your position.</p>
        <a href="/start" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">Start Free Pre-Check &rarr;</a>
      </div>
    </div>
  );
}
