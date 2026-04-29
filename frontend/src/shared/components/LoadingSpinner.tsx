import type { ReactElement } from 'react'

/**
 * LoadingSpinner — canonical centered-spinner primitive.
 *
 * Loading-pattern rule (U-FRM-5):
 *   • Skeleton (list/grid items): use <SkeletonList> (or inline skeleton
 *     rows) for any list or grid where items will populate.  The visual
 *     is matched to the item height so layout shift is minimised.
 *   • Spinner (full-page boot / single-shot fetch): use <LoadingSpinner>
 *     (this component) for top-level page loads and single-record fetches
 *     that replace the whole view.
 *   • Inline spinner (in-form action): the Button primitive's `isLoading`
 *     prop already handles this — do not add anything new.
 */
export function LoadingSpinner(): ReactElement {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-ui-action border-t-transparent" />
    </div>
  )
}
