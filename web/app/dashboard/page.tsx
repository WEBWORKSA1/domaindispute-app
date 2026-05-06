export const metadata = { title: 'Dashboard - DomainDispute' };

export default function DashboardPage() {
  return (
    <div className="max-w-[1320px] mx-auto px-8 py-20">
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-oxblood">Coming soon</span>
      <h1 className="font-serif font-black text-[48px] tracking-tight mt-4 mb-6">Customer Dashboard</h1>
      <p className="text-lg text-muted max-w-2xl mb-4">
        Once you complete a Pre-Check or purchase a tier, your customer dashboard will live here — with case status, document downloads, and progress tracking.
      </p>
      <p className="text-lg text-muted max-w-2xl mb-8">
        For now, start with a free Pre-Check to assess your case strength.
      </p>
      <a href="/start" className="inline-block bg-oxblood text-bone px-6 py-3 font-semibold text-[14px] hover:bg-oxblood-deep transition">
        Start Free Pre-Check &rarr;
      </a>
    </div>
  );
}
