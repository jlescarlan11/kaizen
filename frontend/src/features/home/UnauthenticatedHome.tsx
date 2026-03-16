import type { ReactElement } from 'react'

/**
 * Stub component for the unauthenticated home screen.
 * This is a placeholder for Instruction 2.
 */
export function UnauthenticatedHome(): ReactElement {
  return (
    <div data-testid="unauth-home-stub" className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome to Kaizen</h1>
      <p className="text-muted-foreground">Please log in to access your dashboard.</p>
    </div>
  )
}
