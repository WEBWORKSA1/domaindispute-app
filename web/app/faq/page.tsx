export const metadata = { title: 'FAQ - DomainDispute' };

export default function FaqPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Frequently Asked</span>
      <h1 className="font-serif font-black text-[40px] tracking-tight mt-4 mb-12">Questions</h1>

      <div className="space-y-10">
        <div>
          <h3 className="font-serif text-[22px] mb-3">Is DomainDispute a law firm?</h3>
          <p className="text-muted">No. We are a self-help platform. We provide educational tools and templates that support self-representation under UDRP Rule 4(b) and equivalent rules. We do not provide legal advice.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">Can I really self-represent in a UDRP case?</h3>
          <p className="text-muted">Yes. The UDRP Rules and provider rules (WIPO, Forum, CAC) explicitly permit parties to self-represent. Many respondents and complainants do.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">What does the free Pre-Check tell me?</h3>
          <p className="text-muted">It walks through the three UDRP elements (identical/confusingly similar, no rights, bad faith) against your facts and tells you which patterns from our case library look most similar.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">When should I hire a lawyer instead?</h3>
          <p className="text-muted">If your case involves significant business value at stake, criminal allegations, jurisdictional complexity, or potential counterclaims in court — hire a lawyer. Self-help tools are best for clear-cut cases.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">How are cases sourced?</h3>
          <p className="text-muted">We scrape WIPO and Forum public decision databases at polite rate limits. Every case in our library links back to the primary source so you can verify it yourself.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">Do you offer refunds?</h3>
          <p className="text-muted">Final refund policy will be published prior to paid tier launch. Free Pre-Check is, well, free.</p>
        </div>

        <div>
          <h3 className="font-serif text-[22px] mb-3">More questions?</h3>
          <p className="text-muted">Email hello@domaindispute.com.</p>
        </div>
      </div>
    </div>
  );
}
