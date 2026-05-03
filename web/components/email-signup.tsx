'use client';

import { useState } from 'react';

export function EmailSignup({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setMessage('');

    try {
      const utm = new URLSearchParams(window.location.search);
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          utm_source: utm.get('utm_source') ?? undefined,
          utm_medium: utm.get('utm_medium') ?? undefined,
          utm_campaign: utm.get('utm_campaign') ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Subscribe failed');
      }

      setStatus('success');
      setMessage('Subscribed. Check your inbox tomorrow morning.');
      setEmail('');
    } catch (e) {
      console.error('Subscribe error:', e);
      setStatus('error');
      setMessage('Something went wrong. Please try again or email hello@domaindispute.com.');
    }
  }

  const isDark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
      <input
        type="email"
        placeholder="your@company.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'submitting'}
        className={
          isDark
            ? 'flex-1 bg-bone text-ink px-5 py-3.5 border border-bone font-medium text-sm focus:outline-2 focus:outline-gold-bright disabled:opacity-50'
            : 'flex-1 bg-paper text-ink px-5 py-3.5 border border-ink font-medium text-sm focus:outline-2 focus:outline-oxblood disabled:opacity-50'
        }
      />
      <button
        type="submit"
        disabled={status === 'submitting' || status === 'success'}
        className={
          isDark
            ? 'bg-gold-bright text-ink px-7 py-3.5 font-semibold text-sm tracking-wider uppercase border border-gold-bright hover:bg-bone hover:border-bone transition disabled:opacity-50 disabled:cursor-not-allowed'
            : 'bg-oxblood text-bone px-7 py-3.5 font-semibold text-sm tracking-wider uppercase border border-oxblood hover:bg-oxblood-deep transition disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        {status === 'submitting'
          ? 'Subscribing...'
          : status === 'success'
            ? 'Subscribed'
            : 'Get Daily Alerts'}
      </button>
      {message && (
        <p
          className={`mt-2 sm:absolute sm:mt-14 text-xs ${status === 'success' ? 'text-green-bright' : 'text-red'}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
