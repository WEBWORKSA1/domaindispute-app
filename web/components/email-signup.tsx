'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function EmailSignup({
  variant = 'light',
  compact = false,
  watchField = false,
  cta = 'Subscribe',
}: {
  variant?: 'dark' | 'light';
  compact?: boolean;
  watchField?: boolean;
  cta?: string;
}) {
  const [email, setEmail] = useState('');
  const [watch, setWatch] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    setMessage('');
    try {
      const utm = new URLSearchParams(window.location.search);
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          watch: watch || undefined,
          page: window.location.pathname,
          utm_source: utm.get('utm_source') ?? undefined,
          utm_medium: utm.get('utm_medium') ?? undefined,
          utm_campaign: utm.get('utm_campaign') ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Signup failed. Try again.');
      setStatus('success');
      setMessage('You are subscribed. The next brief arrives tomorrow morning.');
      setEmail('');
      setWatch('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Signup failed. Try again.');
    }
  }

  const dark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn('flex gap-2', compact ? 'flex-row' : 'flex-col sm:flex-row')}>
        <label className="sr-only" htmlFor={`signup-${variant}-${compact}`}>
          Email address
        </label>
        <input
          id={`signup-${variant}-${compact}`}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          className={cn(
            'min-w-0 flex-1 rounded-md px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2',
            dark
              ? 'border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-gold-bright/50'
              : 'border border-ink/20 bg-paper text-ink placeholder:text-muted-2 focus:ring-gold/30',
          )}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={cn(
            'shrink-0 rounded-md px-4 py-2.5 text-[15px] font-semibold transition-colors disabled:opacity-60',
            dark ? 'bg-white text-ink hover:bg-bone' : 'bg-ink text-white hover:bg-ink-soft',
          )}
        >
          {status === 'submitting' ? 'Subscribing…' : cta}
        </button>
      </div>
      {watchField && (
        <div className="mt-2">
          <label className="sr-only" htmlFor="signup-watch">
            Brands or domains to watch
          </label>
          <input
            id="signup-watch"
            type="text"
            placeholder="Optional: brands or domains to watch (comma separated)"
            value={watch}
            onChange={(e) => setWatch(e.target.value)}
            className={cn(
              'w-full rounded-md px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2',
              dark
                ? 'border border-white/20 bg-white/10 text-white placeholder:text-white/50'
                : 'border border-ink/20 bg-paper text-ink placeholder:text-muted-2',
            )}
          />
        </div>
      )}
      {message && (
        <p
          role="status"
          className={cn(
            'mt-2 text-sm',
            status === 'success' ? (dark ? 'text-[#9fe0b8]' : 'text-green') : dark ? 'text-[#ffb4a8]' : 'text-oxblood',
          )}
        >
          {message}
        </p>
      )}
    </form>
  );
}
