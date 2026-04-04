import type { ReactElement } from 'react'

export function BalanceSummaryPage(): ReactElement {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Balance Summary</h1>
        <p className="text-muted-foreground text-sm">
          A detailed breakdown of your current financial status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholders for widgets in Phase 3 */}
        <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
        <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
        <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
      </div>
    </div>
  )
}
