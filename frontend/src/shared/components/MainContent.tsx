import { type ReactNode, type ReactElement } from 'react'
import { cn } from '../lib/cn'

interface MainContentProps {
  children: ReactNode
  className?: string
}

/**
 * MainContent: The primary container for page content.
 * Provides consistent top and bottom breathing room for all pages.
 */
export function MainContent({ children, className }: MainContentProps): ReactElement {
  return (
    <main className={cn('flex-1 py-12 md:py-24', className)}>
      <div className="mx-auto w-full max-w-5xl px-5 md:px-10">{children}</div>
    </main>
  )
}
