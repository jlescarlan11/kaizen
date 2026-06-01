import type { ReactElement } from 'react'
import { pageLayout } from '../../shared/styles/layout'
import { ProfileDisplay } from './ProfileDisplay'

/**
 * ProfilePage: Shell component for the User Profile Viewer.
 * This page is protected by the ProtectedRoute guard.
 */
export function ProfilePage(): ReactElement {
  return (
    <div className="w-full">
      <section className={pageLayout.sectionGap}>
        <ProfileDisplay />
      </section>
    </div>
  )
}
