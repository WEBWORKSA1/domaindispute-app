export const metadata = { title: 'Terms of Service - DomainDispute' };

export default function TermsPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Legal</span>
      <h1 className="font-serif font-black text-[40px] tracking-tight mt-4 mb-6">Terms of Service</h1>
      <p className="text-sm text-muted mb-8">Last updated: drafting. Final terms will be posted before any paid tier becomes available.</p>

      <div className="prose prose-stone max-w-none">
        <h2 className="font-serif text-[22px] mt-8 mb-3">1. Self-Help Platform, Not a Law Firm</h2>
        <p>DomainDispute is a self-help educational platform. We are not a law firm, do not provide legal advice, and using our services does not create an attorney-client relationship. The information and tools we provide are for educational and self-help purposes only.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">2. Self-Representation</h2>
        <p>UDRP Rule 4(b) and equivalent rules permit parties to self-represent in domain dispute proceedings. Our tools support self-representation; they do not substitute for licensed legal counsel where one is needed.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">3. No Outcome Guarantee</h2>
        <p>We make no representations about the outcome of any proceeding. Past case patterns do not guarantee future panel decisions.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">4. User Responsibilities</h2>
        <p>You are responsible for the accuracy of any information you submit, for filing on time, and for compliance with the rules of the relevant dispute resolution provider.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">5. Refunds</h2>
        <p>Refund policy will be finalized prior to launch of paid tiers.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">6. Contact</h2>
        <p>Questions about these terms: hello@domaindispute.com</p>

        <p className="mt-12 text-sm text-muted italic">This page is a placeholder. Full terms will be drafted by counsel before paid tiers launch.</p>
      </div>
    </div>
  );
}
