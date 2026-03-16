import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/Button'

/**
 * UnauthenticatedHome: Content section for the landing page.
 * Strictly adheres to @CODING_STANDARDS.md typography roles and spacing.
 * Horizontal padding is handled by RootLayout.
 */
export function UnauthenticatedHome(): ReactElement {
  return (
    <div className="w-full space-y-12 md:space-y-24">
      {/* ───────── HERO SECTION ───────── */}
      <section className="flex flex-col justify-center" aria-label="Hero">
        {/* Role: caption (metadata/overlines) */}
        <p className="animate-fade-up text-xs leading-5 text-subtle-foreground tracking-wide uppercase mb-4 [animation-delay:0.05s]">
          Filipino Student Finance
        </p>

        {/* Role: display (hero headline) */}
        <h1 className="animate-fade-up font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground mb-6 [animation-delay:0.12s]">
          STOP SAYING{' '}
          <em className="not-italic text-transparent [-webkit-text-stroke:1.5px_var(--ui-text)]">
            "SAYANG"
          </em>{' '}
          TO YOUR MONEY
        </h1>

        {/* Role: body-lg (introductions) */}
        <p className="animate-fade-up max-w-2xl text-lg leading-7 text-muted-foreground mb-8 [animation-delay:0.22s]">
          Track every peso, pause impulse buys, and save for what actually matters. Filipino
          students trust Kaizen to turn regret into better spending habit
        </p>

        <div className="animate-fade-up flex flex-col md:flex-row gap-4 mb-12 [animation-delay:0.30s]">
          <Link to="/register">
            <Button className="w-full md:w-auto">Start your tracking</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" className="w-full md:w-auto">
              See how it works
            </Button>
          </a>
        </div>

        <div className="animate-fade-up flex items-center gap-3 [animation-delay:0.38s]">
          <div className="flex" aria-hidden="true">
            <div className="z-10 h-8 w-8 rounded-full border-2 border-background bg-foreground flex items-center justify-center text-[10px] font-semibold text-background shrink-0">
              JL
            </div>
            <div className="-ml-2 z-20 h-8 w-8 rounded-full border-2 border-background bg-ui-surface-muted flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
              MR
            </div>
            <div className="-ml-2 z-30 h-8 w-8 rounded-full border-2 border-background bg-ui-surface-muted flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
              AK
            </div>
          </div>
          {/* Role: body-sm (metadata) */}
          <p className="text-sm leading-6 text-muted-foreground">
            Joined by <strong className="font-semibold text-foreground">2,400+ students</strong>{' '}
            across the Philippines
          </p>
        </div>
      </section>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease both;
        }
      `}</style>
    </div>
  )
}
