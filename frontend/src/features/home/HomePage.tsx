import type { ReactElement } from 'react'
import { Badge } from '../../shared/components'

export function HomePage(): ReactElement {
  return (
    <section className="space-y-4">
      <Badge>Tailwind is active</Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
        Kaizen UI Starter
      </h1>
      <p className="max-w-2xl text-lg leading-7 text-muted-foreground">
        The frontend foundation is initialized with React, Vite, TypeScript, Redux Toolkit, RTK
        Query, Headless UI, and React Router.
      </p>
    </section>
  )
}
