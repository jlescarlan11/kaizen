import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage(): ReactElement {
  return (
    <section className="mx-auto mt-20 max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">404</p>
      <h1 className="mt-2 text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="mt-3 text-sm text-text-secondary">
        The page you requested does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary-hover"
      >
        Return home
      </Link>
    </section>
  )
}
