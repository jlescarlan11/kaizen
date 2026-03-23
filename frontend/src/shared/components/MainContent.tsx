import { type ReactNode, type ReactElement } from 'react'
import { cn } from '../lib/cn'
import { pageLayout } from '../styles/layout'

interface MainContentProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  density?: 'standard' | 'compact'
}

/**
 * MainContent: The primary container for page content.
 * Provides consistent top and bottom breathing room for all pages.
 */
export function MainContent({
  children,
  className,
  containerClassName,
  density = 'standard',
}: MainContentProps): ReactElement {
  return (
    <main
      className={cn(
        'flex-1',
        pageLayout.shellX,
        density === 'compact' ? pageLayout.pageCompactY : pageLayout.pageY,
        className,
      )}
    >
      <div className={cn('mx-auto w-full max-w-5xl', containerClassName)}>{children}</div>
    </main>
  )
}
