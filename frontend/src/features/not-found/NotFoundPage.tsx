import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../../shared/components'

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate()

  return (
    <section className="mx-auto mt-20 max-w-md">
      <Card className="p-8 text-center">
        <p className="text-xs leading-5 text-subtle-foreground">404</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you requested does not exist or has moved.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex rounded-md bg-ui-action px-4 py-2 text-sm font-medium text-ui-action-text transition hover:bg-ui-action-hover active:bg-ui-action-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
          >
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex rounded-md border border-ui-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-ui-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
          >
            Go home
          </Link>
        </div>
      </Card>
    </section>
  )
}
