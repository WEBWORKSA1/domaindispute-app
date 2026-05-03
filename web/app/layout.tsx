import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://domaindispute.com'),
  title: {
    default: 'DomainDispute.com - Self-Help Platform for UDRP, URS & Domain Dispute Self-Representation',
    template: '%s - DomainDispute.com',
  },
  description:
    'Self-help research, AI analysis, and prepared filings for domain dispute self-representation. UDRP Rules section 4(b) expressly permits pro se filing.',
  keywords: [
    'UDRP self representation',
    'file UDRP without lawyer',
    'domain dispute attorney alternative',
    'cybersquatting recovery',
    'reverse domain name hijacking defense',
    'URS filing',
    'ICANN domain dispute',
  ],
  openGraph: {
    type: 'website',
    siteName: 'DomainDispute.com',
    title: 'DomainDispute.com - Self-Help Platform for Domain Dispute Self-Representation',
    description: 'Skip the $4K-$7K attorney fees. Represent yourself in UDRP, URS, and ccTLD disputes.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
