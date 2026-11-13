import Link from 'next/link';
import { Fragment } from 'react';

/**
 * Minimal, safe Markdown renderer for our own editorial content.
 * Supports: paragraphs, ## / ### headings, - and 1. lists, > quotes,
 * | tables |, **bold**, *italic*, [links](href). No raw HTML.
 */

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('*')) out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (lm) {
        const label = lm[1] ?? '';
        const href = lm[2] ?? '#';
        out.push(
          href.startsWith('/') ? (
            <Link key={key} href={href}>
              {label}
            </Link>
          ) : (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ),
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map((l) => l.trimEnd());
        const key = `b${bi}`;
        const first = lines[0] ?? '';
        if (first.startsWith('### ')) return <h3 key={key}>{inline(first.slice(4), key)}</h3>;
        if (first.startsWith('## ')) {
          const text = first.slice(3);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <h2 key={key} id={id}>
              {inline(text, key)}
            </h2>
          );
        }
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={key}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.slice(2), `${key}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={key}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\d+\.\s/, ''), `${key}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        if (lines.every((l) => l.startsWith('> '))) {
          return <blockquote key={key}>{inline(lines.map((l) => l.slice(2)).join(' '), key)}</blockquote>;
        }
        if (lines.every((l) => l.startsWith('|'))) {
          const rows = lines.filter((l) => !/^\|\s*-/.test(l)).map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
          const [head = [], ...body] = rows;
          return (
            <div key={key} className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    {head.map((h, hi) => (
                      <th key={hi}>{inline(h, `${key}-h${hi}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((c, ci) => (
                        <td key={ci}>{inline(c, `${key}-${ri}-${ci}`)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={key}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && ' '}
                {inline(l, `${key}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
