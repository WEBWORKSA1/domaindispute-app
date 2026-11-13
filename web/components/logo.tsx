/** Mark: a docket seal - a dot (the domain) inside a notched ring (the proceeding). */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="#12233b" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="3.2 2.1" />
      <circle cx="16" cy="16" r="4.2" fill="#b42318" />
    </svg>
  );
}
