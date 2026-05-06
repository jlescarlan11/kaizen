import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { SharedIcon } from './IconRegistry'
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
      <h3 className="text-lg font-bold tracking-tight text-text-primary uppercase">{title}</h3>
      {seeAllHref && (
        <Link
          to={seeAllHref}
          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
        >
          See all <SharedIcon type="ui" name="chevron-right" size={12} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  )
}
