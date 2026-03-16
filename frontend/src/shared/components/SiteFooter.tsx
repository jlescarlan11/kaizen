import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'

interface FooterLink {
  label: string
  to: string
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Privacy', to: '#' },
  { label: 'Terms', to: '#' },
  { label: 'Contact', to: '#' },
]

export function SiteFooter(): ReactElement {
  const currentYear = new Date().getFullYear()
  const isDev = import.meta.env.DEV
  const envName = import.meta.env.MODE

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-ui-border-subtle bg-background">
      <div className="mx-auto w-full max-w-5xl px-5 md:px-10 py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs leading-5 text-subtle-foreground">
              © {currentYear} Kaizen Finance, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs leading-5 text-subtle-foreground">
                  Systems operational
                </span>
              </div>
              {isDev && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-ui-border bg-black/5 text-muted-foreground">
                  {envName}
                </span>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2" aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs leading-5 text-subtle-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={scrollToTop}
              className="text-xs leading-5 text-subtle-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              aria-label="Back to top"
            >
              Back to top
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-180">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </footer>
  )
}
