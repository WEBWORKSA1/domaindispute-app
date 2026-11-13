import { SITE } from '@/lib/site';

/** Shown at the very top of every page. */
export function TopBanner() {
  return (
    <div className="bg-ink text-white">
      <div className="wrap flex min-h-[38px] items-center justify-center py-1.5 text-center text-[13px] leading-snug">
        <a
          href={SITE.inquiryUrl}
          target="_blank"
          rel="noopener"
          className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
        >
          Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership
        </a>
      </div>
    </div>
  );
}
