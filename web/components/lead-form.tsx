'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const SITUATIONS = [
  { id: 'respondent', title: 'I received a complaint', body: 'A UDRP, URS or ccTLD complaint names a domain I own.' },
  { id: 'brand', title: 'Someone is using my brand', body: 'A domain copies my trademark or company name.' },
  { id: 'buyer', title: 'I want a domain someone owns', body: 'I need to buy, recover or negotiate for a domain.' },
  { id: 'other', title: 'Something else', body: 'Research, a second opinion, or a question.' },
] as const;

const HELP = [
  'Guidance to handle it myself',
  'Referral to a domain dispute lawyer',
  'Help negotiating or buying the domain',
  'A second opinion on my draft',
  'Ongoing brand / domain monitoring',
];

type Situation = (typeof SITUATIONS)[number]['id'];

export function LeadForm() {
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState<Situation | ''>('');
  const [domain, setDomain] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [keyDate, setKeyDate] = useState('');
  const [brand, setBrand] = useState('');
  const [urgency, setUrgency] = useState('');
  const [help, setHelp] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [details, setDetails] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const p = new URLSearchParams(window.location.search);
    if (p.get('domain')) setDomain(p.get('domain')!.slice(0, 200));
    if (p.get('case')) setCaseNumber(p.get('case')!.slice(0, 30));
    const s = p.get('situation');
    if (s && SITUATIONS.some((x) => x.id === s)) {
      setSituation(s as Situation);
      setStep(1);
    }
  }, []);

  const steps = ['Situation', 'Details', 'Help needed', 'Contact'];
  const canNext =
    (step === 0 && situation) || (step === 1 && domain.trim().length > 2) || (step === 2 && help.length > 0) || step === 3;

  function go(n: number) {
    setError('');
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError('Tick the consent box so we can reply to you.');
      return;
    }
    setStatus('sending');
    setError('');
    const utm = new URLSearchParams(window.location.search);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'case-review',
          email,
          name,
          role: situation,
          page: window.location.pathname,
          fields: {
            situation: SITUATIONS.find((s) => s.id === situation)?.title ?? situation,
            domain,
            case_number: caseNumber,
            key_date: keyDate,
            brand_or_mark: brand,
            urgency,
            help_wanted: help.join('; '),
            budget,
            phone,
            country,
            details,
          },
          consent,
          website: hp,
          startedAt: startedAt.current,
          utm_source: utm.get('utm_source') ?? undefined,
          utm_medium: utm.get('utm_medium') ?? undefined,
          utm_campaign: utm.get('utm_campaign') ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Sending failed. Try again.');
      setStatus('done');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Sending failed. Try again.');
    }
  }

  if (status === 'done') {
    return (
      <div ref={topRef} className="rounded-xl border border-green/30 bg-[#eef8f2] p-7">
        <h3 className="font-serif text-2xl font-semibold">Your case review request is in.</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          We read every request and reply by email, usually within one business day. If a response deadline is close, we prioritise your request.
        </p>
        <ul className="mt-5 space-y-2 text-[15px]">
          <li>
            Check your deadline now with the <Link href="/tools/deadline-calculator" className="link">deadline calculator</Link>.
          </li>
          <li>
            Read <Link href="/guides/how-to-respond-to-a-udrp-complaint" className="link">how to respond to a UDRP complaint</Link>.
          </li>
          <li>
            Search similar outcomes in the <Link href="/cases" className="link">case library</Link>.
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-24 rounded-xl border border-bone-2 bg-paper p-5 shadow-[0_1px_0_#d9e1ea] sm:p-7">
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s}>
            <div className={cn('h-1.5 rounded-full', i <= step ? 'bg-oxblood' : 'bg-bone-2')} />
            <span className={cn('mt-1.5 block text-xs', i === step ? 'font-semibold text-ink' : 'text-muted')}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={submit}>
        {step === 0 && (
          <fieldset>
            <legend className="mb-4 font-serif text-xl font-semibold">What is your situation?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SITUATIONS.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    'cursor-pointer rounded-lg border p-4 transition-colors',
                    situation === s.id ? 'border-ink bg-bone' : 'border-bone-2 hover:border-ink/40',
                  )}
                >
                  <input
                    type="radio"
                    name="situation"
                    value={s.id}
                    checked={situation === s.id}
                    onChange={() => setSituation(s.id)}
                    className="sr-only"
                  />
                  <span className="block font-semibold text-ink">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.body}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h3 className="font-serif text-xl font-semibold sm:col-span-2">Tell us about the domain</h3>
            <div className="sm:col-span-2">
              <label htmlFor="lf-domain" className="field-label">
                Domain name(s) <span className="text-oxblood">*</span>
              </label>
              <input id="lf-domain" className="field" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" required />
            </div>
            <div>
              <label htmlFor="lf-case" className="field-label">Case number, if any</label>
              <input id="lf-case" className="field" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="D2026-1234" />
            </div>
            <div>
              <label htmlFor="lf-date" className="field-label">Key date (complaint received or deadline)</label>
              <input id="lf-date" type="date" className="field" value={keyDate} onChange={(e) => setKeyDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lf-brand" className="field-label">Trademark or brand involved</label>
              <input id="lf-brand" className="field" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lf-urgency" className="field-label">How urgent is it?</label>
              <select id="lf-urgency" className="field" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="">Choose…</option>
                <option>Deadline within 7 days</option>
                <option>Deadline within 30 days</option>
                <option>No deadline yet</option>
                <option>Just researching</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <fieldset>
              <legend className="mb-4 font-serif text-xl font-semibold">What help would be most useful?</legend>
              <div className="space-y-2">
                {HELP.map((h) => (
                  <label key={h} className="flex cursor-pointer items-center gap-3 rounded-md border border-bone-2 px-4 py-3 hover:border-ink/40">
                    <input
                      type="checkbox"
                      checked={help.includes(h)}
                      onChange={(e) => setHelp((cur) => (e.target.checked ? [...cur, h] : cur.filter((x) => x !== h)))}
                      className="h-4 w-4 accent-[#12233b]"
                    />
                    <span className="text-[15px]">{h}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-5 max-w-sm">
              <label htmlFor="lf-budget" className="field-label">Budget for outside help</label>
              <select id="lf-budget" className="field" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Prefer not to say</option>
                <option>Free guidance only</option>
                <option>Under US$500</option>
                <option>US$500 - 2,000</option>
                <option>US$2,000 - 5,000</option>
                <option>Over US$5,000</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h3 className="font-serif text-xl font-semibold sm:col-span-2">Where should we reply?</h3>
            <div>
              <label htmlFor="lf-name" className="field-label">Name <span className="text-oxblood">*</span></label>
              <input id="lf-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="lf-email" className="field-label">Email <span className="text-oxblood">*</span></label>
              <input id="lf-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="lf-phone" className="field-label">Phone (optional)</label>
              <input id="lf-phone" type="tel" autoComplete="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label htmlFor="lf-country" className="field-label">Country</label>
              <input id="lf-country" autoComplete="country-name" className="field" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lf-details" className="field-label">Anything else we should know?</label>
              <textarea id="lf-details" rows={4} className="field" value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
              <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </div>
            <label className="flex items-start gap-3 text-sm text-ink-soft sm:col-span-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#12233b]" />
              <span>
                I agree that DomainDispute.com may contact me about this request and, if I asked for a referral, share my summary with a lawyer I approve first. See the <Link href="/legal/privacy" className="link">privacy policy</Link>.
              </span>
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-oxblood">
            {error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="btn-outline px-4 py-2.5">
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" disabled={!canNext} onClick={() => go(step + 1)} className="btn-dark px-6 py-2.5 disabled:opacity-40">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={status === 'sending' || !name || !email} className="btn-primary px-6 py-2.5 disabled:opacity-50">
              {status === 'sending' ? 'Sending…' : 'Request my free review'}
            </button>
          )}
        </div>
        <p className="mt-4 text-[13px] text-muted">
          Free, confidential, no obligation. We are not a law firm; a reply is general information, not legal advice.
        </p>
      </form>
    </div>
  );
}
