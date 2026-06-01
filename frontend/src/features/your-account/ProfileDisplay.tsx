import type { ReactElement } from 'react'
import { useGetMeQuery } from '../../app/store/api/authApi'

/**
 * ProfileDisplay: Component that fetches and renders user profile fields.
 * Mounted at the integration point in ProfilePage shell.
 */
export function ProfileDisplay(): ReactElement | null {
  const { data: user, isLoading, isError, refetch } = useGetMeQuery()

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-3 w-1/4 bg-border-subtle rounded" />
        <div className="h-3 w-3/4 bg-border-subtle rounded" />
        <div className="h-3 w-1/2 bg-border-subtle rounded" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-error/10 p-4" role="alert">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm font-medium leading-6 text-error/70">
            Unable to retrieve profile information. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="shrink-0 w-full sm:w-auto text-xs leading-5 font-medium px-3 py-1.5 rounded-lg border border-border-subtle text-error/70 hover:bg-error/10 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const profileFields = [
    {
      label: 'Full name',
      value: user.name || 'Not provided',
    },
    {
      label: 'Email address',
      value: user.email || 'Not provided',
    },
    {
      label: 'Account created',
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Not provided',
    },
  ]

  return (
    <dl className="divide-y divide-border-subtle">
      {profileFields.map((field) => (
        <div key={field.label} className="py-3.5 first:pt-0 last:pb-0">
          <dt className="text-xs leading-5 text-text-secondary">{field.label}</dt>
          <dd className="mt-0.5 text-sm font-medium leading-6 text-text-primary">{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}
