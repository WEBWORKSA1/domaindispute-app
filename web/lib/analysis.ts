/**
 * Deterministic, explainable enrichment for case pages. No AI, no guessing:
 * every statement is derived from the domain string, the parties, or the outcome.
 */

const LEGACY_GTLDS = new Set(['com', 'net', 'org', 'info', 'biz', 'name', 'pro', 'mobi', 'asia', 'tel', 'travel', 'jobs', 'aero', 'coop', 'museum', 'cat']);

const CORP_WORDS = new Set([
  'inc', 'inc.', 'corp', 'corporation', 'company', 'co', 'co.', 'llc', 'ltd', 'ltd.', 'limited', 'gmbh', 'ag', 'sa', 's.a.',
  'sas', 'bv', 'b.v.', 'nv', 'plc', 'spa', 's.p.a.', 'srl', 'ab', 'as', 'oy', 'kg', 'pty', 'group', 'holdings', 'holding',
  'international', 'global', 'the', 'and', '&', 'of', 'de', 'la', 'le', 'operations', 'services', 'brands', 'stichting',
  'compagnie', 'generale', 'des', 'etablissements', 'société', 'societe', 'kabushiki', 'kaisha', 'trademarks', 'licensing',
]);

export function tldOf(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
}

export function sldOf(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : domain.toLowerCase();
}

export function tldKind(tld: string): 'legacy' | 'cc' | 'new' {
  if (LEGACY_GTLDS.has(tld)) return 'legacy';
  if (tld.length === 2) return 'cc';
  return 'new';
}

export function tldKindLabel(tld: string): string {
  const k = tldKind(tld);
  if (k === 'legacy') return 'legacy gTLD';
  if (k === 'cc') return 'country-code TLD';
  return 'new gTLD';
}

/** Lowercase alphanumeric tokens from a party name, minus corporate filler. */
export function brandTokens(name: string | null | undefined): string[] {
  if (!name) return [];
  return name
    .toLowerCase()
    .split(/[\s,/()]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length >= 3 && !CORP_WORDS.has(t));
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)]);
  const at = (i: number, j: number) => dp[i]![j]!;
  for (let j = 1; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i]![j] = Math.min(at(i, j), at(i - 2, j - 2) + 1);
      }
    }
  }
  return at(m, n);
}

export type DomainPattern =
  | { kind: 'exact'; brand: string }
  | { kind: 'brand-plus'; brand: string; extra: string }
  | { kind: 'typo'; brand: string; variant: string }
  | { kind: 'unrelated' };

/** How does the disputed domain relate to the complainant's name? */
export function classifyDomain(domain: string, complainant: string | null | undefined): DomainPattern {
  const sld = sldOf(domain).replace(/[^a-z0-9]/g, '');
  const tokens = brandTokens(complainant);
  if (!sld || tokens.length === 0) return { kind: 'unrelated' };

  const joined = tokens.join('');
  const candidates = Array.from(new Set([joined, ...tokens])).filter((t) => t.length >= 3);

  for (const brand of candidates) {
    if (sld === brand) return { kind: 'exact', brand };
  }
  for (const brand of candidates) {
    if (brand.length >= 4 && sld.includes(brand)) {
      const extra = sldOf(domain).replace(new RegExp(brand.split('').join('[^a-z0-9]?'), 'i'), '').replace(/^[-.]+|[-.]+$/g, '');
      return { kind: 'brand-plus', brand, extra: extra || '(punctuation only)' };
    }
  }
  for (const brand of candidates) {
    if (brand.length >= 5) {
      // compare against every same-length window of the SLD to catch "brand-typo + word"
      for (let len = brand.length - 1; len <= brand.length + 1; len++) {
        for (let i = 0; i + len <= sld.length; i++) {
          const window = sld.slice(i, i + len);
          if (editDistance(window, brand) === 1) return { kind: 'typo', brand, variant: window };
        }
      }
    }
  }
  return { kind: 'unrelated' };
}

export interface Anatomy {
  domain: string;
  sld: string;
  tld: string;
  tldKind: string;
  length: number;
  hyphens: number;
  digits: number;
  pattern: DomainPattern;
}

export function domainAnatomy(domain: string, complainant: string | null | undefined): Anatomy {
  const sld = sldOf(domain);
  const tld = tldOf(domain);
  return {
    domain,
    sld,
    tld,
    tldKind: tldKindLabel(tld),
    length: sld.length,
    hyphens: (sld.match(/-/g) ?? []).length,
    digits: (sld.match(/\d/g) ?? []).length,
    pattern: classifyDomain(domain, complainant),
  };
}

export function patternSentence(p: DomainPattern): string {
  switch (p.kind) {
    case 'exact':
      return `The second-level domain is identical to the complainant's name ("${p.brand}"). Under the first UDRP element, panels typically find identity where the mark is reproduced in full and the TLD is disregarded.`;
    case 'brand-plus':
      return `The domain reproduces the complainant's name ("${p.brand}") and adds "${p.extra}". Panels generally hold that adding descriptive, geographic or other terms does not prevent confusing similarity where the mark remains recognisable.`;
    case 'typo':
      return `The domain contains "${p.variant}", one character away from the complainant's name ("${p.brand}"). This is the classic typosquatting pattern, which panels usually treat as confusingly similar.`;
    default:
      return 'The domain does not literally contain the complainant\'s name. The complainant may rely on a trademark that differs from its company name, so read the decision for the mark actually asserted.';
  }
}

export function outcomeExplainer(outcome: string | null | undefined): { title: string; body: string } {
  switch (outcome) {
    case 'TRANSFER':
      return {
        title: 'What a transfer means',
        body: 'The panel found all three UDRP elements proven: the domain is identical or confusingly similar to the complainant\'s mark, the respondent has no rights or legitimate interests in it, and it was registered and is being used in bad faith. Under Policy paragraph 4(k) the registrar waits ten business days before implementing the transfer, giving the respondent a window to file a court action.',
      };
    case 'OTHER':
      return {
        title: 'What a cancellation means',
        body: 'The complainant proved its case but asked for the domain to be cancelled rather than transferred. Cancelled domains return to the registry and can later be registered by anyone, so brand owners usually prefer a transfer unless they do not want to hold the name.',
      };
    case 'DENY':
      return {
        title: 'What a denial means',
        body: 'The complainant failed to prove at least one of the three elements, so the respondent keeps the domain. A denial is not a finding that the respondent acted well; it means the evidence did not meet the standard. The complainant can still sue in court.',
      };
    case 'RDNH':
      return {
        title: 'What reverse domain name hijacking means',
        body: 'The panel denied the complaint and declared under Rules paragraph 15(e) that it was brought in bad faith, as an abuse of the proceeding. This is the strongest finding a respondent can obtain under the UDRP. There is no monetary award, but the finding is public.',
      };
    case 'SUSPEND':
      return {
        title: 'What a suspension means',
        body: 'Under the URS, a successful complainant gets the domain suspended for the rest of its registration period, not transferred. The domain resolves to a page explaining the suspension.',
      };
    case 'WITHDRAWN':
      return {
        title: 'What a termination means',
        body: 'The proceeding ended without a panel decision. Most terminations follow a settlement (often a transfer agreed between the parties), a withdrawn complaint, or a missing payment. Terminated cases usually have no published decision, so the provider\'s decision link may not exist.',
      };
    case 'DECIDED':
      return {
        title: 'Case closed',
        body: 'The provider lists this case as closed. If a decision was issued, its outcome is added to our library on the next daily refresh; if the parties settled, the case was terminated without a decision.',
      };
    default:
      return {
        title: 'Decision pending',
        body: 'The provider has not published a decision yet. Panels are asked to decide within 14 days of appointment, and most WIPO cases conclude roughly two months after the complaint is filed.',
      };
  }
}

/** UDRP Rules para 5(a): response due within 20 days of commencement; 5(b): +4 calendar days on request. */
export function responseDeadline(commencementIso: string | null | undefined): { due: string; extended: string } | null {
  if (!commencementIso) return null;
  const t = Date.parse(`${commencementIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  const d = (n: number) => new Date(t + n * 86400000).toISOString().slice(0, 10);
  return { due: d(20), extended: d(24) };
}
