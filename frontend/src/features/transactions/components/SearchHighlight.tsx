import type { ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'

interface SearchHighlightProps {
  text: string
  query: string
  className?: string
}

/**
 * SearchHighlight
 *
 * Implement the visual highlighting of the matched portion of each search result row.
 */
export function SearchHighlight({ text, query, className }: SearchHighlightProps): ReactElement {
  if (!query.trim()) {
    return <span className={className}>{text}</span>
  }

  const normalizedQuery = query.toLowerCase().trim()
  const parts = text.split(new RegExp(`(${normalizedQuery})`, 'gi'))

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.toLowerCase() === normalizedQuery &&
              'bg-primary/20 text-primary font-semibold px-0.5 rounded-sm',
          )}
        >
          {part}
        </span>
      ))}
    </span>
  )
}
