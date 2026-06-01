import { type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useBreadcrumbLabel } from './BreadcrumbLabelContext'

const SEGMENT_LABELS: Record<string, string> = {
  transactions: 'Transactions',
  add: 'Add',
  edit: 'Edit',
  history: 'Balance History',
  reminder: 'Reminder',
  budgets: 'Budgets',
  insights: 'Insights',
  goals: 'Goals',
  categories: 'Categories',
  'payment-summary': 'Payment Methods',
  'payment-methods': 'Payment Methods',
  'your-account': 'Account',
  sessions: 'Sessions',
  profile: 'Profile',
  appearance: 'Appearance',
  onboarding: 'Setup',
  balance: 'Balance Setup',
  budget: 'Budget Setup',
  signin: 'Sign In',
  vault: 'Vault',
  playground: 'Playground',
}

function isIdSegment(segment: string): boolean {
  return /^\d+$/.test(segment) || /^[0-9a-f-]{36}$/i.test(segment)
}

interface BreadcrumbItem {
  label: string
  to: string
  isId?: boolean
}

function buildCrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const crumbs: BreadcrumbItem[] = [{ label: 'Home', to: '/' }]
  let cumulativePath = ''

  for (const segment of segments) {
    cumulativePath += `/${segment}`
    const id = isIdSegment(segment)
    const label = id
      ? segment // placeholder — replaced at render time
      : (SEGMENT_LABELS[segment] ??
        segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    crumbs.push({ label, to: cumulativePath, isId: id })
  }

  return crumbs
}

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps): ReactElement | null {
  const { pathname } = useLocation()
  const dynamicLabel = useBreadcrumbLabel()
  const crumbs = buildCrumbs(pathname)

  // On home or single-crumb pages, show nothing
  if (crumbs.length <= 1) return null

  // Replace ID segments with the registered dynamic label (if available)
  const resolvedCrumbs = crumbs.map((crumb) => {
    if (crumb.isId) {
      return { ...crumb, label: dynamicLabel || '…' }
    }
    return crumb
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-xs text-text-secondary', className)}
    >
      {resolvedCrumbs.map((crumb, i) => {
        const isLast = i === resolvedCrumbs.length - 1
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-border-subtle select-none">
                /
              </span>
            )}
            {isLast ? (
              <span
                className="text-text-primary font-medium max-w-[200px] truncate"
                title={crumb.label}
              >
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.to} className="hover:text-text-primary transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
