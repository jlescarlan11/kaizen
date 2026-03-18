import type { ReactElement } from 'react'
import { useGetMeQuery } from '../../app/store/api/authApi'
import { Button } from '../../shared/components'

/**
 * ProfileDisplay: Component that fetches and renders user profile fields.
 * Mounted at the integration point in ProfilePage shell.
 */
export function ProfileDisplay(): ReactElement | null {
  const { data: user, isLoading, isError, refetch } = useGetMeQuery()

  // 1. Loading State: Uses a simple pulse animation
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-1/4 bg-ui-border rounded" />
        <div className="h-4 w-3/4 bg-ui-border rounded" />
        <div className="h-4 w-1/2 bg-ui-border rounded" />
      </div>
    )
  }

  // 2. Integration Point for Instruction 4: Error State
  // Displays a non-technical error message and a retry trigger.
  if (isError) {
    return (
      <div
        className="rounded-lg bg-ui-danger-subtle p-4 text-sm text-ui-danger-text ring-1 ring-ui-danger-subtle"
        role="alert"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-medium">
            Unable to retrieve profile information. Please try again later.
          </p>
          <Button
            variant="secondary"
            onClick={() => void refetch()}
            className="w-full sm:w-auto text-xs py-1.5 h-auto shrink-0"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 3. Success State: Render confirmed profile fields (read-only)
  // Fields: Full Name, Email, Account Created
  const profileFields = [
    { label: 'Full name', value: user.name || 'Not provided' },
    { label: 'Email address', value: user.email || 'Not provided' },
    {
      label: 'Account created',
      value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not provided',
    },
  ]

  return (
    <dl className="divide-y divide-ui-border">
      {profileFields.map((field) => (
        <div key={field.label} className="py-4 first:pt-0 last:pb-0">
          <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 text-base text-foreground font-medium">{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}
