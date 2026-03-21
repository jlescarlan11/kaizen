export const GREEN_THRESHOLD = 0.7
// PRD Open Question 3 marks this lower bound as inferred (71%); confirm before finalizing.
export const YELLOW_THRESHOLD_LOWER = 0.71
export const YELLOW_THRESHOLD_UPPER = 0.99
export const RED_THRESHOLD = 1

export type AllocationStatus = 'safe' | 'high' | 'over'

/** Determines the allocation status given the current ratio of allocation to balance. */
export function computeAllocationStatus(ratio: number): AllocationStatus {
  if (ratio >= RED_THRESHOLD) {
    return 'over'
  }

  if (ratio >= YELLOW_THRESHOLD_LOWER) {
    return 'high'
  }

  return 'safe'
}

/** MAX_UPDATE_LATENCY_MS caps any future debounce logic to 200ms per PRD Section 5a. */
export const MAX_UPDATE_LATENCY_MS = 200
