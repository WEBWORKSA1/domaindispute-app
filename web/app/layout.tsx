import type { Metadata, Viewport } from 'next';
import { TopBanner } from '@/components/top-banner';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieConsent } from '@/components/cookie-consent';
import { StickyCta } from '@/components/sticky-cta';
import { JsonLd } from '@/components/json-ld';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'DomainDispute.com - UDRP case library, live dispute docket & free guidance',
    template: '%s | DomainDispute.com',
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'UDRP',
    'domain name dispute',
    'UDRP decisions',
    'cybersquatting',
    'respond to UDRP complaint',
    'reverse domain name hijacking',
    'URS',
    'WIPO domain dispute',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    url: SITE.url,
    title: 'DomainDispute.com - UDRP case library, live docket & free guidance',
    description: SITE.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true, 'max-image-preview': 'large' as never },
  other: { 'google-adsense-account': SITE.adsenseClient },
};

export const viewport: Viewport = {
  themeColor: '#12233b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - verbatim tag, in <head> on every page. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap"
        />
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE.name,
              url: SITE.url,
              logo: `${SITE.url}/icon.svg`,
              description: SITE.description,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE.name,
              url: SITE.url,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE.url}/cases?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
          ]}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-paper focus:px-3 focus:py-2">
          Skip to content
        </a>
        <TopBanner />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <StickyCta />
        <CookieConsent />
      </body>
    </html>
  );
}
