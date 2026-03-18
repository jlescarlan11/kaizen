import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../shared/components'
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
        label: 'Active Sessions',
        description: 'View and manage devices currently signed in',
        to: '/your-account/sessions',
      },
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
    'flex items-center justify-between rounded-xl border border-ui-border bg-ui-surface px-4 py-4 text-left text-foreground shadow-sm transition-colors',
    item.to
      ? 'hover:bg-ui-accent-subtle hover:border-ui-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus'
      : '',
  )

  const content = (
    <>
      <div className="space-y-1">
        <p className="text-base leading-7 text-foreground">{item.label}</p>
        <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
      </div>
      <span className="text-sm font-medium leading-none text-subtle-foreground" aria-hidden="true">
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
      <header>
        <Card className="rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ui-accent-subtle text-lg leading-7 text-foreground">
              JL
            </div>
            <div className="space-y-1">
              <p className="text-xs leading-5 text-subtle-foreground">Your account</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
                Jordan Lee
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">jordan.lee@kaizen.test</p>
            </div>
          </div>
        </Card>
      </header>

      {accountSections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-lg md:text-xl font-medium leading-snug text-foreground">
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
