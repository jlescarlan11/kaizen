import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { pageLayout } from '../../shared/styles/layout'

export function GoalDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className={pageLayout.sectionGap}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Goal Details</h1>
          <p className="text-muted-foreground">Goal ID: {id}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/goals')}>
          Back to Goals
        </Button>
      </header>

      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-ui-border-subtle rounded-3xl bg-ui-surface-muted/30">
        <div className="h-16 w-16 rounded-full bg-ui-accent-subtle flex items-center justify-center text-ui-action mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 13V2" />
            <path d="M12 13l-4 4" />
            <path d="M12 13l4 4" />
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
        <p className="text-muted-foreground mt-2 max-w-xs text-center">
          We&apos;re working on bringing you full-page goal tracking and visualization. Stay tuned!
        </p>
        <Button className="mt-8" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
