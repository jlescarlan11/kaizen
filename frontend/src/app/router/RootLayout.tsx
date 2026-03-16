import { type ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { SiteHeader, SiteFooter, MainContent } from '../../shared/components'

/**
 * RootLayout: The main application shell.
 * Uses modular SiteHeader, SiteFooter, and MainContent components.
 */
export function RootLayout(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <SiteHeader />

      <MainContent>
        <Outlet />
      </MainContent>

      <SiteFooter />
    </div>
  )
}
