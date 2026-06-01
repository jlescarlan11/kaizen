import { type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'

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
}

function buildCrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const crumbs: BreadcrumbItem[] = [{ label: 'Home', to: '/' }]
  let cumulativePath = ''

  for (const segment of segments) {
    cumulativePath += `/${segment}`
    if (isIdSegment(segment)) continue
    const label =
      SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    crumbs.push({ label, to: cumulativePath })
  }

  return crumbs
}

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps): ReactElement | null {
  const { pathname } = useLocation()
  const crumbs = buildCrumbs(pathname)

  // On the home page or only one crumb, show nothing
  if (crumbs.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-xs text-text-secondary mb-4', className)}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-border-subtle select-none">
                /
              </span>
            )}
            {isLast ? (
              <span className="text-text-primary font-medium">{crumb.label}</span>
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
