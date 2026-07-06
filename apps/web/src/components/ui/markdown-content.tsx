import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

interface LabeledSection {
  label: string;
  body: string;
}

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; label: string; href: string };

const INLINE_PATTERN = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

const LABELED_SECTION_PATTERN = /\*\*([^*]+):\*\*\s*/g;

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    if (match[2]) {
      tokens.push({ type: 'strong', value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'code', value: match[3] });
    } else if (match[4] && match[5]) {
      tokens.push({ type: 'link', label: match[4], href: match[5] });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

function renderInline(text: string): ReactNode[] {
  return tokenizeInline(text).map((token, index) => {
    switch (token.type) {
      case 'strong':
        return (
          <strong key={index} className="font-semibold text-foreground">
            {token.value}
          </strong>
        );
      case 'code':
        return (
          <code
            key={index}
            className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground"
          >
            {token.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={index}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {token.label}
          </a>
        );
      default:
        return token.value;
    }
  });
}

function parseLabeledSections(content: string): LabeledSection[] | null {
  const matches = [...content.matchAll(LABELED_SECTION_PATTERN)];
  if (matches.length === 0) {
    return null;
  }

  const sections: LabeledSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = match[1]?.trim();
    if (!label) {
      continue;
    }

    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? content.length) : content.length;

    sections.push({
      label,
      body: content.slice(start, end).trim(),
    });
  }

  return sections.length > 0 ? sections : null;
}

function normalizeParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function LabeledSections({ sections }: { sections: LabeledSection[] }) {
  return (
    <dl className="space-y-3">
      {sections.map((section) => (
        <div key={section.label}>
          <dt className="font-semibold text-foreground">{section.label}</dt>
          <dd className="mt-0.5">{renderInline(section.body)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="leading-relaxed not-last:mb-3">
          {renderInline(paragraph.replace(/\n/g, ' '))}
        </p>
      ))}
    </>
  );
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const labeledSections = parseLabeledSections(content);
  const paragraphs = labeledSections ? null : normalizeParagraphs(content);

  return (
    <div
      className={cn(
        'min-w-0 wrap-anywhere text-sm leading-relaxed text-muted-foreground',
        className,
      )}
    >
      {labeledSections ? (
        <LabeledSections sections={labeledSections} />
      ) : (
        <Paragraphs paragraphs={paragraphs ?? [content]} />
      )}
    </div>
  );
}
