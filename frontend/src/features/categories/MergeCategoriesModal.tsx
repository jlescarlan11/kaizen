import { useState, type ReactElement } from 'react'
import {
  useGetCategoriesQuery,
  useGetCategoryTransactionCountQuery,
  useMergeCategoriesMutation,
} from '../../app/store/api/categoryApi'
import { Button } from '../../shared/components/Button'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { CategorySelector } from './CategorySelector'

interface MergeCategoriesModalProps {
  open: boolean
  onClose: () => void
}

export function MergeCategoriesModal({ open, onClose }: MergeCategoriesModalProps): ReactElement {
  const { data: categories = [] } = useGetCategoriesQuery()
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const [mergeCategories, { isLoading: isMerging }] = useMergeCategoriesMutation()

  // Only fetch count if we have a source and it's different from target
  const { data: txCount = 0, isLoading: isFetchingCount } = useGetCategoryTransactionCountQuery(
    parseInt(sourceId!),
    { skip: !sourceId || !showConfirm },
  )

  const handleNext = () => {
    if (sourceId && targetId && sourceId !== targetId) {
      setShowConfirm(true)
    }
  }

  // No undo by design — see UNDO_POLICY.md.
  const handleMerge = async () => {
    if (!sourceId || !targetId) return

    try {
      await mergeCategories({
        sourceId: parseInt(sourceId),
        targetId: parseInt(targetId),
      }).unwrap()
      onClose()
      setShowConfirm(false)
      setSourceId(null)
      setTargetId(null)
    } catch (err) {
      console.error('Failed to merge categories:', err)
    }
  }

  const sourceName = categories.find((c) => c.id.toString() === sourceId)?.name
  const targetName = categories.find((c) => c.id.toString() === targetId)?.name

  return (
    <>
      <ResponsiveModal open={open} onClose={onClose} title="Merge Categories">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Consolidate two categories into one. All transactions from the source category will be
            reassigned to the target category.
          </p>

          <div className="space-y-4">
            <CategorySelector
              label="Source Category (to be removed)"
              value={sourceId}
              onChange={setSourceId}
              placeholder="Select source category"
            />

            <CategorySelector
              label="Target Category (to keep)"
              value={targetId}
              onChange={setTargetId}
              placeholder="Select target category"
            />
          </div>

          {sourceId && targetId && sourceId === targetId && (
            <p className="text-sm text-error font-medium">
              Source and target categories must be different.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!sourceId || !targetId || sourceId === targetId}
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Confirmation Step */}
      <ResponsiveModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Category Merge"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-ui-surface-muted border border-ui-border-subtle space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-semibold text-foreground">{sourceName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-semibold text-foreground">{targetName}</span>
            </div>
            <div className="pt-2 border-t border-ui-border-subtle flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Affected Transactions:</span>
              {isFetchingCount ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <span className="font-semibold text-primary">{txCount}</span>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to merge <strong>{sourceName}</strong> into{' '}
            <strong>{targetName}</strong>? This action will permanently delete the source category.
          </p>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleMerge} isLoading={isMerging}>
              Merge Now
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </>
  )
}
