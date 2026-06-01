import { type ReactElement } from 'react'
import { useRouteError } from 'react-router-dom'
import { Button } from './Button'

export function AppErrorPage(): ReactElement {
  const routeError = useRouteError()
  const message =
    routeError instanceof Error
      ? routeError.message
      : typeof routeError === 'string'
        ? routeError
        : null

  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4">
      <p className="select-none text-[8rem] font-bold leading-none text-border-subtle">!</p>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
        We hit a snag while loading this page. Try reloading or head back home.
      </p>
      {message && (
        <p className="mt-2 max-w-sm break-words font-mono text-xs text-text-secondary/60">
          {message}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="ghost" onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </div>
  )
}
