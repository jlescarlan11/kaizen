import { type ReactNode, type ReactElement } from 'react'
import { cn } from '../lib/cn'

interface MainContentProps {
  children: ReactNode
  className?: string
  containerClassName?: string
}

/**
 * MainContent: The primary container for page content.
 * Provides consistent top and bottom breathing room for all pages.
 */
export function MainContent({
  children,
  className,
  containerClassName,
}: MainContentProps): ReactElement {
  return (
    <main className={cn('flex-1 py-12 md:py-24', className)}>
      <div className={cn('mx-auto w-full max-w-5xl px-5 md:px-10', containerClassName)}>
        {children}
      </div>
    </main>
  )
}
