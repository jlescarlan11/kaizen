import type { ReactElement } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { KaizenLogo } from '../../shared/components/KaizenLogo'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Playground', to: '/playground' },
]

export function RootLayout(): ReactElement {
  return (
    <div className="min-h-screen bg-ui-bg text-foreground">
      <header className="border-b border-ui-border bg-ui-surface">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <NavLink
            to="/"
            end
            className="flex items-center gap-3 rounded-md text-foreground transition-opacity hover:opacity-90"
            aria-label="Kaizen home"
          >
            <KaizenLogo className="h-10 w-10 shrink-0" />
            <span className="text-sm font-medium leading-none text-foreground">Kaizen</span>
          </NavLink>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }): string =>
                  [
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-ui-accent-subtle text-foreground hover:bg-ui-accent-subtle'
                      : 'text-foreground hover:bg-ui-accent-subtle hover:text-foreground',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
