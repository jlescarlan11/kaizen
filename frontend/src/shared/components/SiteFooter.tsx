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
    <footer className="border-t border-border-subtle bg-background px-6 md:px-10">
      <div className="mx-auto w-full max-w-7xl py-12 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-xs font-bold leading-5 text-text-secondary">
              © {currentYear} Kaizen Finance, Inc. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-text-secondary">
                  Systems operational
                </span>
              </div>
              {isDev && (
                <span className="text-3xs font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-border-subtle bg-surface-secondary text-text-secondary">
                  {envName}
                </span>
              )}
            </div>
          </div>

          <nav
            className="flex flex-wrap justify-center md:justify-start gap-x-10 gap-y-3"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={scrollToTop}
              className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              aria-label="Back to top"
            >
              Back to top
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="rotate-180">
                <path
                  d="M19 9l-7 7-7-7"
                  stroke="currentColor"
                  strokeWidth="3"
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
