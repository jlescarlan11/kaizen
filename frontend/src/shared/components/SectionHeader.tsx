import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'

interface SectionHeaderProps {
  title: string
  seeAllHref?: string
  className?: string
}

/**
 * SectionHeader: A reusable header for sections with an optional "See all" link.
 */
export function SectionHeader({ title, seeAllHref, className }: SectionHeaderProps): ReactElement {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {seeAllHref && (
        <Link
          to={seeAllHref}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          See all <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
