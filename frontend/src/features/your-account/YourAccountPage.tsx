import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../shared/lib/cn'

type AccountItem = {
  label: string
  description: string
  to?: string
}

const accountSections: ReadonlyArray<{
  title: string
  items: ReadonlyArray<AccountItem>
}> = [
  {
    title: 'Preferences',
    items: [
      {
        label: 'Appearance',
        description: 'Theme preference and display options',
        to: '/your-account/appearance',
      },
      {
        label: 'Notification',
        description: 'Manage reminders and activity alerts',
      },
      {
        label: 'Help',
        description: 'Support resources and app guidance',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Statement and reports',
        description: 'Download statements and export summaries',
      },
      {
        label: 'Personal details',
        description: 'Update your profile and contact information',
      },
      {
        label: 'Close Account',
        description: 'Permanently close this Kaizen account',
      },
      {
        label: 'Log out',
        description: 'Sign out from this device',
      },
    ],
  },
]

function AccountRow({ item }: { item: AccountItem }): ReactElement {
  const baseClassName = cn(
    'flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-4 text-left shadow-sm transition-colors',
    item.to
      ? 'hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      : '',
  )

  const content = (
    <>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary">{item.label}</p>
        <p className="text-sm text-text-secondary">{item.description}</p>
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          item.to ? 'text-text-secondary' : 'text-text-tertiary',
        )}
        aria-hidden="true"
      >
        {item.to ? '>' : ''}
      </span>
    </>
  )

  if (item.to) {
    return (
      <Link to={item.to} className={baseClassName}>
        {content}
      </Link>
    )
  }

  return (
    <div className={baseClassName} aria-disabled="true">
      {content}
    </div>
  )
}

export function YourAccountPage(): ReactElement {
  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-lg font-semibold text-text-primary">
            JL
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              Your account
            </p>
            <h1 className="text-2xl font-bold text-text-primary">Jordan Lee</h1>
            <p className="text-sm text-text-secondary">jordan.lee@kaizen.test</p>
          </div>
        </div>
      </header>

      {accountSections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.items.map((item) => (
              <AccountRow key={item.label} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
