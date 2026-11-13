import { cn } from '@/lib/utils';

/** Plain GET form - works without JavaScript and is crawlable. */
export function SearchBox({
  action = '/cases',
  defaultValue,
  placeholder = 'Search a domain, brand, party or case number',
  size = 'md',
  label = 'Search',
  className,
  hidden,
}: {
  action?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: 'md' | 'lg';
  label?: string;
  className?: string;
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" role="search" className={cn('flex w-full gap-2', className)}>
      <label htmlFor={`q-${action}`} className="sr-only">
        {placeholder}
      </label>
      <input
        id={`q-${action}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn('field flex-1', size === 'lg' && 'py-3.5 text-[17px]')}
        autoComplete="off"
        enterKeyHint="search"
      />
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <button type="submit" className={cn('btn-dark', size === 'lg' && 'px-6 text-base')}>
        {label}
      </button>
    </form>
  );
}
