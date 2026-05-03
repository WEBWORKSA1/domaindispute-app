/**
 * Daily case alert email template.
 *
 * Sent to email_subscribers once per day. Contains:
 *   - Last 24h new filings (from live_filings)
 *   - Last 24h published decisions (from cases)
 *   - One featured pattern (rotating through the 12)
 *
 * Phase 1: this template module. Phase 2 adds the cron job that sends.
 */

import type { CaseRow, LiveFilingRow } from '@/types/database';

interface EmailContext {
  recipientEmail: string;
  unsubscribeUrl: string;
  newFilings: Array<Pick<LiveFilingRow, 'provider' | 'case_number' | 'domains' | 'complainant' | 'filing_url'>>;
  newDecisions: Array<
    Pick<CaseRow, 'provider' | 'case_number' | 'domains' | 'outcome' | 'complainant_name' | 'decision_url'>
  >;
  featuredPattern?: {
    name: string;
    slug: string;
    blurb: string;
  };
  dateLabel: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function outcomeBgColor(outcome: string | null): { bg: string; fg: string } {
  switch (outcome) {
    case 'TRANSFER':
      return { bg: '#2d4a2b', fg: '#f4eee2' };
    case 'DENY':
      return { bg: '#a87a3c', fg: '#1a1410' };
    case 'RDNH':
      return { bg: '#6b1a1a', fg: '#f4eee2' };
    case 'SUSPEND':
      return { bg: '#1a1410', fg: '#f4eee2' };
    default:
      return { bg: '#6b5e52', fg: '#f4eee2' };
  }
}

/**
 * Render the daily alert as HTML.
 * Uses table-based layout for email-client compatibility.
 */
export function renderDailyCaseAlert(ctx: EmailContext): { subject: string; html: string; text: string } {
  const subject = ctx.newFilings.length + ' new disputes filed - ' + ctx.dateLabel;

  const filingsRows = ctx.newFilings
    .slice(0, 12)
    .map((f) => {
      const provider = escapeHtml(f.provider);
      const caseNum = escapeHtml(f.case_number);
      const domain = escapeHtml(f.domains[0] ?? '-');
      const extraDomains = f.domains.length > 1 ? ' +' + (f.domains.length - 1) : '';
      const complainant = escapeHtml(f.complainant ?? 'Complainant pending');
      return '<tr><td style="padding:14px 0;border-bottom:1px dashed #d4cab5;">' +
        '<div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#6b1a1a;font-weight:600;margin-bottom:4px;">' +
        provider + ' &middot; ' + caseNum +
        '</div>' +
        '<div style="font-family:Georgia,serif;font-size:17px;font-weight:600;color:#1a1410;margin-bottom:2px;">' +
        domain + extraDomains +
        '</div>' +
        '<div style="font-size:13px;color:#6b5e52;font-style:italic;">' + complainant + '</div>' +
        '</td></tr>';
    })
    .join('');

  const decisionsRows = ctx.newDecisions
    .slice(0, 8)
    .map((d) => {
      const colors = outcomeBgColor(d.outcome);
      const provider = escapeHtml(d.provider);
      const caseNum = escapeHtml(d.case_number);
      const domain = escapeHtml(d.domains[0] ?? '-');
      const outcomeBadge = d.outcome
        ? '<span style="background:' + colors.bg + ';color:' + colors.fg + ';padding:2px 7px;margin-left:8px;">' + escapeHtml(d.outcome) + '</span>'
        : '';
      return '<tr><td style="padding:14px 0;border-bottom:1px dashed #d4cab5;">' +
        '<div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#6b1a1a;font-weight:600;margin-bottom:4px;">' +
        provider + ' &middot; ' + caseNum + outcomeBadge +
        '</div>' +
        '<div style="font-family:Georgia,serif;font-size:17px;font-weight:600;color:#1a1410;">' + domain + '</div>' +
        '</td></tr>';
    })
    .join('');

  const featuredPatternBlock = ctx.featuredPattern
    ? '<tr><td style="padding:32px 0;border-bottom:1px solid #1a1410;">' +
      '<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b5e52;margin-bottom:12px;">Featured Pattern</div>' +
      '<a href="https://domaindispute.com/patterns/' + escapeHtml(ctx.featuredPattern.slug) + '" style="text-decoration:none;color:#1a1410;">' +
      '<h3 style="font-family:Georgia,serif;font-size:24px;margin:0 0 8px 0;">' + escapeHtml(ctx.featuredPattern.name) + '</h3>' +
      '<p style="font-size:15px;line-height:1.6;color:#2d2520;margin:0;">' + escapeHtml(ctx.featuredPattern.blurb) + '</p>' +
      '</a></td></tr>'
    : '';

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>' + escapeHtml(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background-color:#fbf7ee;font-family:system-ui,sans-serif;color:#1a1410;">' +
    '<table cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fbf7ee;">' +
    '<tr><td align="center" style="padding:32px 16px;">' +
    '<table cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;">' +
    '<tr><td style="padding-bottom:24px;border-bottom:1px solid #1a1410;">' +
    '<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b5e52;margin-bottom:8px;">Daily Case Alert &middot; ' + escapeHtml(ctx.dateLabel) + '</div>' +
    '<a href="https://domaindispute.com" style="text-decoration:none;color:#1a1410;"><span style="font-family:Georgia,serif;font-size:28px;font-weight:900;letter-spacing:-0.02em;">DomainDispute.com</span></a>' +
    '</td></tr>' +
    '<tr><td style="padding:24px 0;"><h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px 0;">New Filings (last 24h)</h2><table width="100%">' + filingsRows + '</table></td></tr>' +
    '<tr><td style="padding:24px 0;border-top:1px solid #d4cab5;"><h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px 0;">Recent Decisions</h2><table width="100%">' + decisionsRows + '</table></td></tr>' +
    featuredPatternBlock +
    '<tr><td style="padding:24px 0;font-size:11px;color:#6b5e52;text-align:center;">' +
    'You receive this because you signed up at domaindispute.com.<br/>' +
    '<a href="' + escapeHtml(ctx.unsubscribeUrl) + '" style="color:#6b5e52;">Unsubscribe</a> &middot; ' +
    '<a href="https://domaindispute.com" style="color:#6b5e52;">Visit site</a>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';

  // Plaintext fallback
  const text = [
    'DomainDispute.com - Daily Case Alert',
    ctx.dateLabel,
    '',
    'NEW FILINGS (last 24h):',
    ...ctx.newFilings.slice(0, 12).map(
      (f) => '  ' + f.provider + ' ' + f.case_number + ' - ' + (f.domains[0] ?? '-')
    ),
    '',
    'RECENT DECISIONS:',
    ...ctx.newDecisions.slice(0, 8).map(
      (d) => '  ' + d.provider + ' ' + d.case_number + ' - ' + (d.domains[0] ?? '-') + (d.outcome ? ' [' + d.outcome + ']' : '')
    ),
    '',
    'Visit: https://domaindispute.com',
    'Unsubscribe: ' + ctx.unsubscribeUrl,
  ].join('\n');

  return { subject, html, text };
}
