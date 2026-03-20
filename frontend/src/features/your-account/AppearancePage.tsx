import type { ReactElement } from 'react'
import { useTheme, type Theme } from '../../providers/theme'
import { cn } from '../../shared/lib/cn'

const themeOptions: ReadonlyArray<{
  value: Theme
  label: string
  description?: string
  icon: ReactElement
}> = [
  {
    value: 'light',
    label: 'Light',
    icon: <SunIcon />,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <MoonIcon />,
  },
  {
    value: 'system',
    label: 'System',
    icon: <SystemIcon />,
  },
]

export function AppearancePage(): ReactElement {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <section className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Appearance
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Choose how Kaizen looks on this device.
        </p>
      </div>

      {/* Theme options */}
      <div className="divide-y divide-ui-border-subtle">
        {themeOptions.map((option) => {
          const isSelected = theme === option.value
          const description =
            option.value === 'system'
              ? `Follows your device setting (currently ${resolvedTheme})`
              : undefined

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={isSelected}
              className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-ui-surface-muted active:bg-ui-surface-subtle -mx-4 w-[calc(100%+2rem)]"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-subtle bg-ui-surface-muted text-foreground">
                {option.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-6 text-foreground">{option.label}</p>
                {description && (
                  <p className="text-xs leading-5 text-subtle-foreground mt-0.5">{description}</p>
                )}
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  'h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'border-foreground bg-foreground' : 'border-ui-border-strong',
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-ui-bg" />}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ───────── ICONS ───────── */

function SunIcon(): ReactElement {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon(): ReactElement {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SystemIcon(): ReactElement {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}
