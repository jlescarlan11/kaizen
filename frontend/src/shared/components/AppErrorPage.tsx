import { type ReactElement } from 'react'
import { useRouteError } from 'react-router-dom'

export function AppErrorPage(): ReactElement {
  // useRouteError returns undefined when rendered outside a React Router context
  // (e.g. as a Sentry ErrorBoundary fallback), which is handled gracefully below.
  const routeError = useRouteError()
  const message =
    routeError instanceof Error
      ? routeError.message
      : typeof routeError === 'string'
        ? routeError
        : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="w-full max-w-2xl space-y-4 rounded-2xl border border-ui-border bg-background/70 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          We hit a snag while loading the dashboard. You can refresh the page or head back to the
          start.
        </p>
        <p className="text-sm leading-6 text-subtle-foreground break-words">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2 text-sm font-semibold leading-6 text-on-primary transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <a
            href="/"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
