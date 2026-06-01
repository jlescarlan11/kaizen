import { type ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CardHeaderProps {
  icon: ReactNode
  title: string
  titleClassName?: string
  right?: ReactNode
  className?: string
}

export function CardHeader({ icon, title, titleClassName, right, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        {icon}
        <p
          className={cn(
            'text-2xs font-semibold uppercase tracking-wide text-text-secondary',
            titleClassName,
          )}
        >
          {title}
        </p>
      </div>
      {right}
    </div>
  )
}
