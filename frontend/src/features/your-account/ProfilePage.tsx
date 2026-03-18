import type { ReactElement } from 'react'
import { ProfileDisplay } from './ProfileDisplay'

/**
 * ProfilePage: Shell component for the User Profile Viewer.
 * This page is protected by the ProtectedRoute guard.
 */
export function ProfilePage(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Personal details</h1>
        <p className="text-muted-foreground">
          Review the account information associated with your profile.
        </p>
      </header>

      {/* 
        Integration Point for Instruction 3:
        Mount the ProfileDisplay component here to render user data.
      */}
      <div className="rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-sm">
        <ProfileDisplay />
      </div>
    </div>
  )
}
