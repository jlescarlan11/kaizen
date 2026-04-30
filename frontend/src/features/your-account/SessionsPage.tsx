import type { ReactElement } from 'react'
import { useState } from 'react'
import { useGetSessionsQuery, useRevokeSessionMutation } from '../../app/store/api/sessionApi'
import { DestructiveActionDialog } from '../../shared/components/DestructiveActionDialog'
import { pageLayout } from '../../shared/styles/layout'

export function SessionsPage(): ReactElement {
  const { data: sessions, isLoading } = useGetSessionsQuery()
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation()
  const [revokeTargetId, setRevokeTargetId] = useState<number | null>(null)

  const handleRevoke = async (): Promise<void> => {
    if (revokeTargetId == null) return
    try {
      await revokeSession(revokeTargetId).unwrap()
    } catch (error) {
      console.error('Failed to revoke session', error)
    } finally {
      setRevokeTargetId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ui-border-strong border-t-transparent" />
      </div>
    )
  }

  return (
    <section className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Active sessions
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          View and manage devices currently signed in to your account.
        </p>
      </header>

      <div>
        {sessions?.length === 0 && (
          <p className="text-sm leading-6 text-muted-foreground text-center py-8">
            No active sessions found.
          </p>
        )}

        {sessions && sessions.length > 0 && (
          <div className="divide-y divide-ui-border-subtle">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3.5 px-4 py-3.5 -mx-4">
                {/* Device icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-subtle bg-ui-surface-muted text-foreground">
                  <DeviceIcon />
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-6 text-foreground">
                      {session.isCurrent ? 'This device' : 'Other device'}
                    </p>
                    {session.isCurrent && (
                      <span className="text-xs leading-5 font-medium px-2 py-0.5 rounded-full bg-ui-accent-subtle text-ui-accent-text">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 text-subtle-foreground">
                    Signed in{' '}
                    {new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    Expires{' '}
                    {new Date(session.expiresAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Revoke action */}
                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => setRevokeTargetId(session.id)}
                    disabled={isRevoking}
                    className="shrink-0 text-xs leading-5 font-medium text-ui-danger-text-soft hover:text-ui-danger-text-soft hover:bg-ui-danger-subtle px-3 py-1.5 rounded-lg border border-ui-border-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DestructiveActionDialog
        isOpen={revokeTargetId != null}
        onClose={() => setRevokeTargetId(null)}
        onConfirm={handleRevoke}
        title="Revoke session?"
        description="This device will be signed out immediately. Any unsaved work on that device will be lost."
        confirmLabel="Revoke"
        isConfirming={isRevoking}
      />
    </section>
  )
}

/* ───────── ICONS ───────── */

function DeviceIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}
