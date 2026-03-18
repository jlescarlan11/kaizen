import type { ReactElement } from 'react'
import { Card, Button } from '../../shared/components'
import { useGetSessionsQuery, useRevokeSessionMutation } from '../../app/store/api/sessionApi'

export function SessionsPage(): ReactElement {
  const { data: sessions, isLoading } = useGetSessionsQuery()
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation()

  const handleRevoke = async (id: number) => {
    try {
      await revokeSession(id).unwrap()
    } catch (error) {
      console.error('Failed to revoke session', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Active Sessions</h1>
        <p className="text-sm text-muted-foreground">
          View and manage devices currently signed in to your account.
        </p>
      </header>

      <div className="space-y-4">
        {sessions?.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">
                    {session.isCurrent ? 'Current Session' : 'Other Device'}
                  </p>
                  {session.isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-ui-accent-subtle px-2 py-0.5 text-xs font-medium text-foreground">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Signed in on: {new Date(session.createdAt).toLocaleDateString()} at{' '}
                  {new Date(session.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-xs text-subtle-foreground">
                  Expires on: {new Date(session.expiresAt).toLocaleDateString()}
                </p>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(session.id)}
                  disabled={isRevoking}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Revoke
                </Button>
              )}
            </div>
          </Card>
        ))}

        {sessions?.length === 0 && (
          <p className="text-center text-muted-foreground">No active persistent sessions found.</p>
        )}
      </div>
    </section>
  )
}
