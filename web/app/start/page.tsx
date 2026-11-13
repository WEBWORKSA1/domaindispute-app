'use client';

import { useState } from 'react';
import Link from 'next/link';
import { runPreCheck, type UserRole, type PreCheckResult } from '@/lib/precheck/logic';

type Step = 'role' | 'domain' | 'tm' | 'history' | 'result';

export default function StartPage() {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [domain, setDomain] = useState('');
  const [hasTrademark, setHasTrademark] = useState<boolean | null>(null);
  const [domainOlderThanTM, setDomainOlderThanTM] = useState<boolean | null>(null);
  const [hasOfferedToBuy, setHasOfferedToBuy] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<PreCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!role || !domain) return;
    setSubmitting(true);

    try {
      // Try server first; fall back to client-side logic
      const utm = new URLSearchParams(window.location.search);
      const response = await fetch('/api/precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          domain,
          hasTrademark: hasTrademark ?? false,
          domainOlderThanTM: domainOlderThanTM ?? false,
          hasOfferedToBuy: hasOfferedToBuy ?? false,
          email: email || undefined,
          utm_source: utm.get('utm_source') ?? undefined,
          utm_medium: utm.get('utm_medium') ?? undefined,
          utm_campaign: utm.get('utm_campaign') ?? undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        // Fallback to client-side
        setResult(runPreCheck({
          role,
          domain,
          hasTrademark: hasTrademark ?? false,
          domainOlderThanTM: domainOlderThanTM ?? false,
          hasOfferedToBuy: hasOfferedToBuy ?? false,
        }));
      }
    } catch {
      setResult(runPreCheck({
        role,
        domain,
        hasTrademark: hasTrademark ?? false,
        domainOlderThanTM: domainOlderThanTM ?? false,
        hasOfferedToBuy: hasOfferedToBuy ?? false,
      }));
    } finally {
      setStep('result');
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-paper min-h-[70vh] px-4 py-12 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood mb-6 inline-flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-oxblood animate-pulse-slow" />
          Free Pre-Check &middot; Form A-0
        </div>

        {step !== 'result' && (
          <div className="mb-8 flex gap-2">
            {(['role', 'domain', 'tm', 'history'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 ${
                  step === s
                    ? 'bg-oxblood'
                    : ['role', 'domain', 'tm', 'history'].indexOf(step) > i
                      ? 'bg-ink'
                      : 'bg-bone-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Role */}
        {step === 'role' && (
          <div>
            <h1 className="h-display text-display-md mb-3">Who are you?</h1>
            <p className="text-ink-soft mb-8">Step 1 of 4</p>
            <div className="space-y-3">
              <RoleButton label="I own a trademark and want to recover a domain" sub="(Complainant)" onClick={() => { setRole('COMPLAINANT'); setStep('domain'); }} />
              <RoleButton label="I own a domain and someone is challenging it" sub="(Respondent)" onClick={() => { setRole('RESPONDENT'); setStep('domain'); }} />
              <RoleButton label="I represent a client (counsel)" sub="(Counsel)" onClick={() => { setRole('COUNSEL'); setStep('domain'); }} />
            </div>
          </div>
        )}

        {/* Step 2: Domain */}
        {step === 'domain' && (
          <div>
            <h1 className="h-display text-display-md mb-3">Which domain?</h1>
            <p className="text-ink-soft mb-8">Step 2 of 4</p>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value.trim().toLowerCase())}
              placeholder="example.com"
              className="w-full px-5 py-4 border border-ink text-lg bg-paper focus:outline-2 focus:outline-oxblood mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setStep('role')} className="px-6 py-3 border border-ink text-ink hover:bg-bone transition">
                &larr; Back
              </button>
              <button
                onClick={() => domain && setStep('tm')}
                disabled={!domain}
                className="flex-1 bg-ink text-bone px-6 py-3 hover:bg-oxblood transition disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Trademark */}
        {step === 'tm' && (
          <div>
            <h1 className="h-display text-display-md mb-3">
              {role === 'RESPONDENT' ? 'Do they have a registered trademark?' : 'Do you have a registered trademark?'}
            </h1>
            <p className="text-ink-soft mb-8">Step 3 of 4 - This is the threshold question for UDRP standing.</p>
            <div className="space-y-3">
              <YesNoButton label="Yes, registered" onClick={() => { setHasTrademark(true); setStep('history'); }} />
              <YesNoButton label="No, or only pending" onClick={() => { setHasTrademark(false); setStep('history'); }} />
            </div>
            <button onClick={() => setStep('domain')} className="mt-6 px-6 py-3 border border-ink text-ink hover:bg-bone transition">
              &larr; Back
            </button>
          </div>
        )}

        {/* Step 4: History */}
        {step === 'history' && (
          <div>
            <h1 className="h-display text-display-md mb-3">Two more questions</h1>
            <p className="text-ink-soft mb-8">Step 4 of 4 - About chronology and prior negotiations.</p>

            <div className="mb-8">
              <p className="font-semibold mb-3">
                {role === 'RESPONDENT' ? 'Was the domain registered before their trademark existed?' : 'Was the domain registered before your trademark existed?'}
              </p>
              <div className="space-y-2">
                <YesNoButton label="Yes" small onClick={() => setDomainOlderThanTM(true)} active={domainOlderThanTM === true} />
                <YesNoButton label="No" small onClick={() => setDomainOlderThanTM(false)} active={domainOlderThanTM === false} />
              </div>
            </div>

            <div className="mb-8">
              <p className="font-semibold mb-3">
                {role === 'RESPONDENT' ? 'Did the complainant offer to buy the domain before filing?' : 'Have you previously offered to buy this domain?'}
              </p>
              <div className="space-y-2">
                <YesNoButton label="Yes" small onClick={() => setHasOfferedToBuy(true)} active={hasOfferedToBuy === true} />
                <YesNoButton label="No" small onClick={() => setHasOfferedToBuy(false)} active={hasOfferedToBuy === false} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Email (optional - to receive your detailed report)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-ink bg-paper focus:outline-2 focus:outline-oxblood"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('tm')} className="px-6 py-3 border border-ink text-ink hover:bg-bone transition">
                &larr; Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={domainOlderThanTM === null || hasOfferedToBuy === null || submitting}
                className="flex-1 bg-oxblood text-bone px-6 py-3 hover:bg-oxblood-deep transition disabled:opacity-50"
              >
                {submitting ? 'Analyzing...' : 'Get My Pre-Check Result'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div>
            <div className={`inline-block font-mono text-xs tracking-[0.18em] uppercase px-3 py-1 mb-4 ${
              result.verdict === 'STRONG' ? 'bg-green text-bone'
                : result.verdict === 'MODERATE' ? 'bg-gold text-ink'
                  : result.verdict === 'WEAK' ? 'bg-amber text-ink'
                    : 'bg-oxblood text-bone'
            }`}>
              Verdict: {result.verdict}
            </div>
            <h1 className="h-display text-display-md mb-4">{result.headline}</h1>
            <p className="text-lg text-ink-soft leading-relaxed mb-8">{result.summary}</p>

            {result.flags.length > 0 && (
              <div className="border-l-4 border-oxblood bg-bone p-6 mb-8">
                <h3 className="font-semibold mb-3">Flags</h3>
                <ul className="text-sm space-y-2">
                  {result.flags.map((f, i) => <li key={i}>&bull; {f}</li>)}
                </ul>
              </div>
            )}

            <div className="border-l-4 border-green bg-paper p-6 mb-8 border border-ink">
              <h3 className="font-semibold mb-3">Recommendations</h3>
              <ul className="text-sm space-y-3">
                {result.recommendations.map((r, i) => <li key={i}>&bull; {r}</li>)}
              </ul>
            </div>

            {result.similarPattern && (
              <div className="mb-8">
                <Link
                  href={`/patterns/${result.similarPattern}`}
                  className="inline-flex items-center gap-2 text-oxblood hover:underline"
                >
                  Read more about this pattern &rarr;
                </Link>
              </div>
            )}

            <div className="mt-12 rounded-xl bg-ink p-8 text-white">
              <h3 className="font-serif text-xl font-semibold">Want a person to look at it?</h3>
              <p className="mt-2 text-white/80">
                Get a free, confidential case review. We compare your facts with similar decisions and reply by email, usually within one business day.
              </p>
              <Link
                href={`/get-help?situation=${role === 'RESPONDENT' ? 'respondent' : 'brand'}&domain=${encodeURIComponent(domain)}`}
                className="btn-primary mt-5"
              >
                Get my free case review
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RoleButton({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left p-5 border border-ink bg-paper hover:bg-bone transition"
    >
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-muted mt-1">{sub}</div>
    </button>
  );
}

function YesNoButton({ label, onClick, small = false, active = false }: { label: string; onClick: () => void; small?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left ${small ? 'p-3' : 'p-4'} border border-ink transition ${
        active ? 'bg-ink text-bone' : 'bg-paper hover:bg-bone'
      }`}
    >
      {label}
    </button>
  );
}
