'use client';

import { useMemo, useState } from 'react';

function addDays(iso: string, n: number) {
  const t = Date.parse(`${iso}T00:00:00Z`) + n * 86400000;
  return new Date(t);
}
function addBusinessDays(d: Date, n: number) {
  const out = new Date(d);
  let left = n;
  while (left > 0) {
    out.setUTCDate(out.getUTCDate() + 1);
    const day = out.getUTCDay();
    if (day !== 0 && day !== 6) left--;
  }
  return out;
}
const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function DeadlineCalculator() {
  const [date, setDate] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const rows = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const due = addDays(date, 20);
    const ext = addDays(date, 24);
    const panelFrom = addDays(date, 21);
    const panelTo = addDays(date, 29);
    const decisionFrom = addDays(date, 35);
    const decisionTo = addDays(date, 47);
    const implFrom = addBusinessDays(decisionFrom, 13);
    const daysLeft = Math.ceil((due.getTime() - Date.parse(`${today}T00:00:00Z`)) / 86400000);
    return { due, ext, panelFrom, panelTo, decisionFrom, decisionTo, implFrom, daysLeft };
  }, [date, today]);

  return (
    <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
      <label htmlFor="commencement" className="field-label">
        Commencement date
      </label>
      <input id="commencement" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field max-w-xs" />

      {rows && (
        <div className="mt-6" aria-live="polite">
          <div className={`rounded-lg p-4 ${rows.daysLeft < 0 ? 'bg-bone' : rows.daysLeft <= 7 ? 'bg-[#fdebe4]' : 'bg-legal-pad'}`}>
            <p className="text-sm text-ink-soft">Response due</p>
            <p className="font-serif text-2xl font-semibold text-ink">{fmt(rows.due)}</p>
            <p className="mt-1 text-sm font-medium">
              {rows.daysLeft > 1 && `${rows.daysLeft} days from today.`}
              {rows.daysLeft === 1 && 'Tomorrow.'}
              {rows.daysLeft === 0 && 'Today.'}
              {rows.daysLeft < 0 && 'This date has passed. A late response may still be considered at the panel\'s discretion; contact the provider immediately.'}
            </p>
          </div>
          <dl className="mt-5 divide-y divide-bone-2 border-y border-bone-2 text-[15px]">
            <Row label="With the automatic 4-day extension" value={fmt(rows.ext)} />
            <Row label="Panel usually appointed" value={`${fmt(rows.panelFrom)} - ${fmt(rows.panelTo)}`} />
            <Row label="Decision usually issued" value={`${fmt(rows.decisionFrom)} - ${fmt(rows.decisionTo)}`} />
            <Row label="Earliest transfer if complainant wins" value={`after ${fmt(rows.implFrom)}`} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
