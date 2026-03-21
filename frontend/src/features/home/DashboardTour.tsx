import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import type { DashboardTourAnchorKey } from './DashboardTourAnchorsContext'
import { useDashboardTourAnchors } from './DashboardTourAnchorsHooks'
import { useMarkTourCompletedMutation } from '../../app/store/api/authApi'

const TOUR_START_DELAY_MS = 0
// TODO: PRD Open Question 3 is unresolved. Confirm whether the tour needs a short delay or a data-loading gate before it starts.

const TOUR_PANEL_MAX_WIDTH = 320
const TOUR_PANEL_PADDING = 16
const TOUR_PANEL_ESTIMATED_HEIGHT = 140

const TOUR_STEPS: ReadonlyArray<{
  anchorKey: DashboardTourAnchorKey
  copy: string
  position: 'below' | 'above'
}> = [
  {
    anchorKey: 'balanceCard',
    copy: 'This shows your current balance.',
    position: 'below',
  },
  {
    anchorKey: 'addTransactionButton',
    copy: 'Tap here to add transactions.',
    position: 'below',
  },
  {
    anchorKey: 'budgetsTab',
    copy: 'View your budget progress here.',
    position: 'above',
  },
  {
    anchorKey: 'goalsTab',
    copy: 'Set savings goals.',
    position: 'above',
  },
]

export function DashboardTour() {
  const { user } = useAuthState()
  const anchors = useDashboardTourAnchors()
  const [markTourCompleted] = useMarkTourCompletedMutation()

  const [tourReady, setTourReady] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  const currentStep = TOUR_STEPS[currentStepIndex]
  const anchorNode = currentStep ? anchors[currentStep.anchorKey] : null

  useEffect(() => {
    if (!user) {
      return
    }

    if (user.tourCompleted) {
      return
    }

    const timer = window.setTimeout(() => {
      setCurrentStepIndex(0)
      setTourReady(true)
    }, TOUR_START_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      setTourReady(false)
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const closeTour = useCallback(async () => {
    setTourReady(false)
    setCurrentStepIndex(0)
    try {
      await markTourCompleted().unwrap()
    } catch (error) {
      console.error('Failed to mark tour completed:', error)
    }
  }, [markTourCompleted])

  const goToNextStep = useCallback(() => {
    if (currentStepIndex >= TOUR_STEPS.length - 1) {
      closeTour()
      return
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1))
  }, [currentStepIndex, closeTour])

  const handleSkip = useCallback(() => {
    closeTour()
  }, [closeTour])

  const handleNext = useCallback(() => {
    goToNextStep()
  }, [goToNextStep])

  const tooltipStyle = useMemo(() => {
    if (!anchorNode) {
      return undefined
    }

    const anchorRect = anchorNode.getBoundingClientRect()
    const clippedWidth = Math.min(TOUR_PANEL_MAX_WIDTH, viewport.width - TOUR_PANEL_PADDING * 2)
    const left = Math.max(
      TOUR_PANEL_PADDING,
      Math.min(
        viewport.width - clippedWidth - TOUR_PANEL_PADDING,
        anchorRect.left + anchorRect.width / 2 - clippedWidth / 2,
      ),
    )

    const offsetY = 14
    const top =
      currentStep?.position === 'above'
        ? Math.max(TOUR_PANEL_PADDING, anchorRect.top - offsetY - TOUR_PANEL_ESTIMATED_HEIGHT)
        : Math.min(viewport.height - TOUR_PANEL_PADDING, anchorRect.bottom + offsetY)

    return { left, top, width: clippedWidth }
  }, [anchorNode, viewport.height, viewport.width, currentStep])

  const highlightStyle = useMemo(() => {
    if (!anchorNode) {
      return undefined
    }

    const anchorRect = anchorNode.getBoundingClientRect()
    const padding = 8
    return {
      top: Math.max(0, anchorRect.top - padding),
      left: Math.max(0, anchorRect.left - padding),
      width: anchorRect.width + padding * 2,
      height: anchorRect.height + padding * 2,
    }
  }, [anchorNode])

  const isOpen = tourReady && !!user && !user?.tourCompleted

  if (!isOpen || !currentStep || !tooltipStyle) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-auto">
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      {highlightStyle && (
        <div
          aria-hidden="true"
          className="pointer-events-none border-2 border-ui-action rounded-2xl shadow-[0_0_0_3px_rgba(255,255,255,0.45)]"
          style={highlightStyle}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute rounded-2xl bg-ui-surface p-6 shadow-2xl text-foreground border border-ui-border max-w-full"
        style={{ ...tooltipStyle }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Step {currentStepIndex + 1} / {TOUR_STEPS.length}
          </p>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-ui-action hover:text-ui-action-hover"
          >
            Skip
          </button>
        </div>
        <p className="mt-4 text-lg font-semibold leading-snug text-foreground">
          {currentStep.copy}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Stay focused on the tour.</p>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center rounded-full bg-ui-action px-4 py-2 text-xs font-semibold text-ui-action-text shadow-sm transition hover:bg-ui-action-hover"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
