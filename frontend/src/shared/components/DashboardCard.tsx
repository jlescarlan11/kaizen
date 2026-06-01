import { type ReactNode } from 'react'
import { cn } from '../lib/cn'

interface DashboardCardProps {
  children: ReactNode
  className?: string
}

export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div
      className={cn('p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm', className)}
    >
      {children}
    </div>
  )
}
