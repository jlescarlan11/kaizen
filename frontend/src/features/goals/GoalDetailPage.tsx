import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { pageLayout } from '../../shared/styles/layout'

export function GoalDetailPage(): ReactElement {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <div className={pageLayout.sectionGap}>
        <div className="bento-card flex w-full flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SharedIcon type="ui" name="target" size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Goals Coming Soon</h2>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Goal tracking is on the roadmap. Stay tuned for updates.
          </p>
          <Button className="mt-8" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
