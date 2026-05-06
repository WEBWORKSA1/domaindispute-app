import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ caseNumber: string }>;
}

async function getCase(caseNumber: string) {
  const supabase = createServerClient();
  const decoded = decodeURIComponent(caseNumber);

  const { data: caseRow } = await supabase
    .from('cases')
    .select('id, provider, case_number, complainant_name, respondent_name, domains, outcome, decision_date, decision_url, is_published')
    .eq('case_number', decoded)
    .eq('is_published', true)
    .maybeSingle();

  if (caseRow) {
    return {
      provider: String(caseRow.provider || 'WIPO'),
      case_number: String(caseRow.case_number || decoded),
      complainant: caseRow.complainant_name ? String(caseRow.complainant_name) : null,
      respondent: caseRow.respondent_name ? String(caseRow.respondent_name) : null,
      domains: Array.isArray(caseRow.domains) ? caseRow.domains.map(String) : [],
      outcome: caseRow.outcome ? String(caseRow.outcome) : null,
      decision_date: caseRow.decision_date ? String(caseRow.decision_date) : null,
      source_url: caseRow.decision_url ? String(caseRow.decision_url) : null,
      is_pending: false,
    };
  }

  const { data: filing } = await supabase
    .from('live_filings')
    .select('id, provider, case_number, complainant, domains, status, scraped_at, filing_url')
    .eq('case_number', decoded)
    .maybeSingle();

  if (filing) {
    return {
      provider: String(filing.provider || 'WIPO'),
      case_number: String(filing.case_number || decoded),
      complainant: filing.complainant ? String(filing.complainant) : null,
      respondent: null,
      domains: Array.isArray(filing.domains) ? filing.domains.map(String) : [],
      outcome: null,
      decision_date: null,
      source_url: filing.filing_url ? String(filing.filing_url) : null,
      is_pending: true,
    };
  }

  return null;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseNumber } = await params;
  const c = await getCase(caseNumber);
  if (!c) notFound();

  const wipoSearchUrl = `https://www.wipo.int/amc/en/domains/search/text.jsp?case=${encodeURIComponent(c.case_number)}`;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>
        <Link href="/" style={{ color: '#888' }}>Home</Link>
        {' / '}
        <Link href={c.is_pending ? '/live' : '/cases'} style={{ color: '#888' }}>
          {c.is_pending ? 'Live Feed' : 'Case Library'}
        </Link>
        {' / '}
        <span>{c.case_number}</span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ background: '#1a1a1a', color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
          {c.provider}
        </span>
        <span style={{ color: '#7a0019', fontSize: 13, fontFamily: 'monospace' }}>
          {c.case_number}
        </span>
        <span style={{ background: c.is_pending ? '#fef3c7' : (c.outcome === 'TRANSFER' ? '#d1fae5' : '#fee2e2'), color: c.is_pending ? '#92400e' : (c.outcome === 'TRANSFER' ? '#065f46' : '#991b1b'), padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 12 }}>
          {c.is_pending ? 'PENDING' : (c.outcome || 'PENDING')}
        </span>
      </div>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24, lineHeight: 1.2, wordBreak: 'break-word' }}>
        {c.domains[0] || c.case_number}
        {c.domains.length > 1 && (
          <span style={{ display: 'block', fontSize: 18, fontWeight: 400, color: '#666', marginTop: 4 }}>
            + {c.domains.length - 1} other domain{c.domains.length > 2 ? 's' : ''}
          </span>
        )}
      </h1>

      {c.is_pending && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: 16, marginBottom: 24, borderRadius: 4 }}>
          <strong>Pending decision.</strong> This case has been filed but the panel has not issued a decision yet.
        </div>
      )}

      <dl style={{ marginBottom: 32 }}>
        {c.complainant && (
          <div style={{ marginBottom: 16 }}>
            <dt style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Complainant</dt>
            <dd style={{ marginLeft: 0, fontSize: 16 }}>{c.complainant}</dd>
          </div>
        )}
        {c.respondent && (
          <div style={{ marginBottom: 16 }}>
            <dt style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Respondent</dt>
            <dd style={{ marginLeft: 0, fontSize: 16 }}>{c.respondent}</dd>
          </div>
        )}
        {c.decision_date && (
          <div style={{ marginBottom: 16 }}>
            <dt style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Decided</dt>
            <dd style={{ marginLeft: 0, fontSize: 16 }}>{c.decision_date}</dd>
          </div>
        )}
        {c.domains.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <dt style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>All disputed domains</dt>
            <dd style={{ marginLeft: 0, fontSize: 14, fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {c.domains.join(', ')}
            </dd>
          </div>
        )}
      </dl>

      <div style={{ borderTop: '1px solid #ddd', paddingTop: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>View on {c.provider}</h2>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
          Some terminated/withdrawn cases do not have a published PDF. If the link below 404s, try the search link.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {c.source_url && (
            <a
              href={c.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#7a0019', color: '#fff', padding: '12px 20px', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
            >
              View original
            </a>
          )}
          {c.provider === 'WIPO' && (
            <a
              href={wipoSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#7a0019', textDecoration: 'underline', alignSelf: 'center', fontSize: 14 }}
            >
              Search WIPO database
            </a>
          )}
        </div>
      </div>

      <div style={{ background: '#f5f5f0', padding: 24, borderRadius: 4 }}>
        <h3 style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>About this case</h3>
        <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
          Use our free Pre-Check to assess your case strength.
        </p>
        <Link
          href="/start"
          style={{ display: 'inline-block', background: '#7a0019', color: '#fff', padding: '10px 18px', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
        >
          Start Free Pre-Check
        </Link>
      </div>
    </div>
  );
}
