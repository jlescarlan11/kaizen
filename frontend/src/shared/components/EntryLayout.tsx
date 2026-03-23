import { type ReactElement, type ReactNode } from 'react'
import { pageLayout } from '../styles/layout'
import { KaizenLogo, typography } from './'

interface EntryLayoutProps {
  children: ReactNode
  layoutMode?: 'split' | 'single'
  header?: ReactNode
  footer?: ReactNode
  title?: ReactNode
  description?: ReactNode
  logoAdornment?: ReactNode
  hideLogo?: boolean
  hideSecondaryText?: boolean
}

export function EntryLayout({
  children,
  layoutMode = 'split',
  header,
  footer,
  title,
  description,
  logoAdornment,
  hideLogo,
  hideSecondaryText,
}: EntryLayoutProps): ReactElement {
  const currentYear = new Date().getFullYear()

  if (layoutMode === 'single') {
    return (
      <div className="mx-auto flex w-full max-w-3xl justify-center">
        <div className="w-full max-w-2xl space-y-8 text-center md:space-y-9">
          <header className="space-y-5">
            <div className="flex items-center justify-center space-x-4">
              {!hideLogo && <KaizenLogo className="h-20 w-20" />}
              {logoAdornment ? <div>{logoAdornment}</div> : null}
            </div>
            <div className="space-y-2.5">
              <h1 className={typography.h1}>{title ?? 'Welcome to Kaizen'}</h1>
              <p className={typography['body-lg']}>
                {description ?? 'The Finance Manager for Every Filipino Student'}
              </p>
            </div>
            {header ? <div className={pageLayout.headerGap}>{header}</div> : null}
          </header>

          <div>{children}</div>

          <footer>
            {footer ?? (
              <p className={typography.caption}>
                {'\u00A9'} {currentYear} Kaizen Finance, Inc. All rights reserved.
              </p>
            )}
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20">
      <div className="flex flex-col justify-center">
        <div className="mx-auto w-full max-w-md space-y-5 text-center md:space-y-6 lg:max-w-xl lg:text-left">
          <header className="flex flex-col items-center space-y-5 lg:items-start lg:space-y-4">
            <div className="flex w-full items-center justify-center space-x-4 lg:justify-start">
              {!hideLogo && <KaizenLogo className="h-20 w-20 lg:h-12 lg:w-12" />}
              {logoAdornment ? <div>{logoAdornment}</div> : null}
            </div>
            <div className="space-y-2.5 lg:space-y-3">
              <h1 className={typography.h1}>{title ?? 'Welcome to Kaizen'}</h1>
              <p className={typography['body-lg']}>
                {description ?? 'The Finance Manager for Every Filipino Student'}
              </p>
            </div>
          </header>

          <div className="hidden space-y-6 lg:block">
            {!hideSecondaryText ? (
              <p className={`max-w-lg ${typography['body-sm']}`}>
                Track every peso, pause impulse buys, and save for what actually matters.
              </p>
            ) : null}
            <p className={typography.caption}>
              {'\u00A9'} {currentYear} Kaizen Finance, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center lg:mt-0 lg:justify-start">
        <div className="w-full max-w-md space-y-6 text-center md:space-y-7 lg:max-w-xl lg:text-left">
          {header ? <div className={pageLayout.headerGap}>{header}</div> : null}

          <div className="flex-grow">{children}</div>

          <footer className="lg:hidden">
            {footer ?? (
              <p className={typography.caption}>
                {'\u00A9'} {currentYear} Kaizen Finance, Inc. All rights reserved.
              </p>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}
