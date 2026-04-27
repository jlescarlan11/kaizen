import * as Sentry from '@sentry/react'

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    return // Sentry disabled when DSN is unset (dev default).
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  })
}
