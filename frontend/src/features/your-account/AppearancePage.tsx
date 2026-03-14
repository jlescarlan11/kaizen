import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, type Theme } from '../../providers/theme'
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
          className="inline-flex rounded-md px-1 py-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to account
        </Link>
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Preferences
          </p>
          <h1 className="text-2xl font-bold text-text-primary">Appearance</h1>
          <p className="text-sm text-text-secondary">
            Choose how Kaizen looks across your account.
          </p>
        </header>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Theme</h2>

        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  'rounded-lg border p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isSelected
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-surface hover:bg-surface-secondary',
                )}
                aria-pressed={isSelected}
              >
                <div className="text-center">
                  <div className="mb-1 text-base font-semibold text-text-secondary">
                    {option.icon}
                  </div>
                  <div className="text-sm text-text-primary">{option.label}</div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-text-tertiary">
          {theme === 'system'
            ? `Following system preference (${resolvedTheme})`
            : `Theme set to ${theme} mode`}
        </p>
      </div>
    </section>
  )
}
