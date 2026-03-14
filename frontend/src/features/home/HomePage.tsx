import type { ReactElement } from 'react'

export function HomePage(): ReactElement {
  return (
    <section className="space-y-4">
      <p className="inline-flex rounded-full bg-success-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success-dark">
        Tailwind is active
      </p>
      <h1 className="text-3xl font-bold text-text-primary">Kaizen UI Starter</h1>
      <p className="max-w-2xl text-sm text-text-secondary">
        The frontend foundation is initialized with React, Vite, TypeScript, Redux Toolkit, RTK
        Query, Headless UI, and React Router.
      </p>
    </section>
  )
}
