import type { ReactElement } from 'react'
import { pageLayout } from '../../shared/styles/layout'
import { ProfileDisplay } from './ProfileDisplay'

/**
 * ProfilePage: Shell component for the User Profile Viewer.
 * This page is protected by the ProtectedRoute guard.
 */
export function ProfilePage(): ReactElement {
  return (
    <section className={pageLayout.sectionGap}>
      <div className={pageLayout.headerGap}>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Personal details
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Review the account information associated with your profile.
        </p>
      </div>

      <ProfileDisplay />
    </section>
  )
}
