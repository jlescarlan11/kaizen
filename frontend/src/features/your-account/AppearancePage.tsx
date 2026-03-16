import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, type Theme } from '../../providers/theme'
import { Card } from '../../shared/components'
import { cn } from '../../shared/lib/cn'

const themeOptions: ReadonlyArray<{
  value: Theme
  label: string
  icon: string
}> = [
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'dark', label: 'Dark', icon: 'Moon' },
  { value: 'system', label: 'System', icon: 'Auto' },
]

export function AppearancePage(): ReactElement {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Link
          to="/your-account"
          className="inline-flex rounded-md px-1 py-1 text-sm font-medium leading-none text-foreground transition-colors hover:bg-ui-accent-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
        >
          Back to account
        </Link>
        <header className="space-y-2">
          <p className="text-xs leading-5 text-subtle-foreground">Preferences</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
            Appearance
          </h1>
          <p className="text-lg leading-7 text-muted-foreground">
            Choose how Kaizen looks across your account.
          </p>
        </header>
      </div>

      <Card className="rounded-2xl">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
          Theme
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  'rounded-lg border p-3 text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus',
                  isSelected
                    ? 'border-ui-accent bg-ui-accent-subtle'
                    : 'border-ui-border bg-ui-surface hover:bg-ui-accent-subtle hover:border-ui-border-strong',
                )}
                aria-pressed={isSelected}
              >
                <div className="text-center">
                  <div className="mb-1 text-sm font-medium leading-none text-foreground">
                    {option.icon}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{option.label}</p>
                </div>
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs leading-5 text-subtle-foreground">
          {theme === 'system'
            ? `Following system preference (${resolvedTheme})`
            : `Theme set to ${theme} mode`}
        </p>
      </Card>
    </section>
  )
}
