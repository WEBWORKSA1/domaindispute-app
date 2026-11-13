import Link from 'next/link';
import { SearchBox } from '@/components/search-box';

export default function NotFound() {
  return (
    <section className="wrap py-20">
      <p className="docket-no text-sm text-gold">404</p>
      <h1 className="h-display mt-2 text-display-sm">This page is not on the docket</h1>
      <p className="mt-3 max-w-xl text-[17px] text-ink-soft">
        The link may be mistyped, or the case may not be indexed yet. New filings are added several times a day. Search for it instead:
      </p>
      <SearchBox className="mt-6 max-w-xl" />
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <li><Link href="/" className="link">Home</Link></li>
        <li><Link href="/live" className="link">Live docket</Link></li>
        <li><Link href="/guides" className="link">Guides</Link></li>
        <li><Link href="/get-help" className="link">Free case review</Link></li>
      </ul>
    </section>
  );
}
