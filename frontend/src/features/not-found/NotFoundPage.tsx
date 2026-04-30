import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'

const QUICK_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Budgets', to: '/budgets' },
]

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4">
      <p className="select-none text-[8rem] font-bold leading-none text-ui-border-subtle">404</p>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Looks like you're lost
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Button onClick={() => navigate(-1)}>Go back</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Go home
        </Button>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick links
        </p>
        <div className="flex flex-col items-start gap-2">
          {QUICK_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} className="text-sm font-medium text-primary hover:underline">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
