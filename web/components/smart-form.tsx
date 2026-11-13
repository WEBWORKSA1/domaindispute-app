'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FormType } from '@/lib/forms';
import { cn } from '@/lib/utils';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date' | 'textarea' | 'select' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  half?: boolean;
  help?: string;
  defaultValue?: string;
  rows?: number;
}

export interface SmartFormProps {
  form: FormType;
  fields: FieldDef[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  role?: string;
  consentLabel?: string;
  className?: string;
  dark?: boolean;
}

export function SmartForm({
  form,
  fields,
  submitLabel,
  successTitle,
  successBody,
  role,
  consentLabel = 'I agree that DomainDispute.com may contact me about this request.',
  className,
}: SmartFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ''])),
  );
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef<number>(0);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    // Allow pre-filling via query string, e.g. /contact?topic=Advertising
    const params = new URLSearchParams(window.location.search);
    setValues((v) => {
      const next = { ...v };
      for (const f of fields) {
        const q = params.get(f.name);
        if (q && !next[f.name]) next[f.name] = q.slice(0, 300);
      }
      return next;
    });
  }, [fields]);

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus();
  }, [status]);

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setError('Tick the consent box so we can reply to you.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError('');
    const { email = '', name = '', ...rest } = values;
    const utm = new URLSearchParams(window.location.search);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form,
          email,
          name: name || undefined,
          role,
          page: window.location.pathname,
          fields: rest,
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
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Sending failed. Try again.');
    }
  }

  if (status === 'done') {
    return (
      <div ref={doneRef} tabIndex={-1} className={cn('rounded-lg border border-green/30 bg-[#eef8f2] p-6 outline-none', className)}>
        <h3 className="font-serif text-xl font-semibold text-ink">{successTitle}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{successBody}</p>
        <p className="mt-4 text-sm text-muted">
          While you wait: browse the <Link href="/cases" className="link">case library</Link> or read the{' '}
          <Link href="/guides" className="link">guides</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn('grid gap-4 sm:grid-cols-2', className)} noValidate={false}>
      {fields.map((f) => {
        const id = `${form}-${f.name}`;
        const common = {
          id,
          name: f.name,
          required: f.required,
          value: values[f.name] ?? '',
          placeholder: f.placeholder,
        };
        return (
          <div key={f.name} className={f.half ? 'sm:col-span-1' : 'sm:col-span-2'}>
            {f.type !== 'radio' && (
              <label htmlFor={id} className="field-label">
                {f.label}
                {f.required && <span className="text-oxblood"> *</span>}
              </label>
            )}
            {f.type === 'textarea' ? (
              <textarea {...common} rows={f.rows ?? 5} className="field" onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <select {...common} className="field" onChange={(e) => set(f.name, e.target.value)}>
                <option value="">Choose…</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === 'radio' ? (
              <fieldset>
                <legend className="field-label">
                  {f.label}
                  {f.required && <span className="text-oxblood"> *</span>}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {f.options?.map((o) => (
                    <label
                      key={o}
                      className={cn(
                        'cursor-pointer rounded-md border px-3.5 py-2 text-[15px]',
                        values[f.name] === o ? 'border-ink bg-ink text-white' : 'border-ink/20 bg-paper hover:border-ink/50',
                      )}
                    >
                      <input
                        type="radio"
                        name={f.name}
                        value={o}
                        checked={values[f.name] === o}
                        onChange={() => set(f.name, o)}
                        className="sr-only"
                        required={f.required}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <input
                {...common}
                type={f.type ?? 'text'}
                autoComplete={f.name === 'email' ? 'email' : f.name === 'name' ? 'name' : f.name === 'phone' ? 'tel' : undefined}
                className="field"
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
            {f.help && <p className="mt-1 text-[13px] text-muted">{f.help}</p>}
          </div>
        );
      })}

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft sm:col-span-2">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#12233b]"
        />
        <span>
          {consentLabel} See our <Link href="/legal/privacy" className="link">privacy policy</Link>.
        </span>
      </label>

      {status === 'error' && error && (
        <p role="alert" className="text-sm font-medium text-oxblood sm:col-span-2">
          {error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'sending'} className="btn-primary w-full sm:w-auto disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
        <p className="mt-2 text-[13px] text-muted">Your details stay private. We never sell or publish them.</p>
      </div>
    </form>
  );
}
