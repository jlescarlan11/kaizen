import type { ReactElement } from 'react'
import { useTheme, type Theme } from '../../providers/theme'
import { cn } from '../../shared/lib/cn'
import { pageLayout } from '../../shared/styles/layout'

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
    <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-24')}>
      {/* Page header */}
      <header className="mb-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tighter text-text-primary uppercase">
            Appearance
          </h1>
          <p className="text-base font-medium text-text-secondary tracking-tight opacity-60">
            Choose how Kaizen looks on this device.
          </p>
        </div>
      </header>

      {/* Theme options */}
      <div role="radiogroup" aria-label="Theme selection" className="grid grid-cols-1 gap-3">
        {themeOptions.map((option) => {
          const isSelected = theme === option.value
          const description =
            option.value === 'system' ? `Follows device setting (${resolvedTheme})` : undefined

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left group',
                isSelected
                  ? 'bg-white border-primary shadow-lg shadow-primary/5'
                  : 'bg-white border-border-subtle hover:border-primary/20',
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all',
                  isSelected
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/10'
                    : 'bg-surface-secondary border-border-subtle text-text-secondary group-hover:text-text-primary',
                )}
              >
                {option.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold tracking-tight text-text-primary uppercase leading-none">
                  {option.label}
                </p>
                {description && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-40 mt-1">
                    {description}
                  </p>
                )}
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  'h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-border-subtle group-hover:border-primary/20',
                )}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-text-primary"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ───────── ICONS ───────── */

function SunIcon(): ReactElement {
  return (
    <svg
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
