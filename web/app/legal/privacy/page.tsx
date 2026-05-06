export const metadata = { title: 'Privacy Policy - DomainDispute' };

export default function PrivacyPage() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Legal</span>
      <h1 className="font-serif font-black text-[40px] tracking-tight mt-4 mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: drafting. Final policy will be posted before any paid tier becomes available.</p>

      <div className="prose prose-stone max-w-none">
        <h2 className="font-serif text-[22px] mt-8 mb-3">What We Collect</h2>
        <p>When you use DomainDispute, we may collect: email address (for newsletter/account), Pre-Check form data (the facts of your case), payment information (handled by Stripe), and standard analytics (page views, browser type).</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">How We Use It</h2>
        <p>To deliver the service you purchased, send relevant updates, improve the platform, and meet legal obligations. We do not sell personal data.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">Data Sharing</h2>
        <p>We share data only with service providers required to operate the platform (Stripe for payments, Brevo for email, Supabase for hosted database). Each is bound by their own privacy commitments.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">Your Rights</h2>
        <p>You may request access, correction, or deletion of your data at any time by emailing hello@domaindispute.com. Quebec residents (Law 25) and EU residents (GDPR) have specific additional rights and can invoke them by the same email.</p>

        <h2 className="font-serif text-[22px] mt-8 mb-3">Contact</h2>
        <p>hello@domaindispute.com</p>

        <p className="mt-12 text-sm text-muted italic">This page is a placeholder. Full privacy policy will be drafted before paid tiers launch.</p>
      </div>
    </div>
  );
}
