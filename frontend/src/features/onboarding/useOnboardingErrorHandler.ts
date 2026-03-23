import { useCallback, useRef, useState } from 'react'
import type { OnboardingStep } from './onboardingStep'
import { MAX_RETRY_ATTEMPTS, mapOnboardingError } from './onboardingErrorMapper'
import type { UserFacingOnboardingError } from './onboardingErrorMapper'

type RequestFactory<T> = () => Promise<T>

export function useOnboardingErrorHandler(step: OnboardingStep) {
  const lastRequestRef = useRef<RequestFactory<unknown> | null>(null)
  const [error, setError] = useState<UserFacingOnboardingError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleRequest = useCallback(
    async <T>(factory: RequestFactory<T>): Promise<T> => {
      lastRequestRef.current = factory
      setRetryCount(0)
      setError(null)
      try {
        const result = await factory()
        lastRequestRef.current = null
        return result
      } catch (requestError) {
        const mapped = mapOnboardingError(requestError, step)
        setError(mapped)
        setRetryCount((count) => Math.min(count + 1, MAX_RETRY_ATTEMPTS))
        throw requestError
      }
    },
    [step],
  )

  const retry = useCallback(async (): Promise<void> => {
    if (!lastRequestRef.current || retryCount >= MAX_RETRY_ATTEMPTS) {
      return
    }

    try {
      await lastRequestRef.current()
      lastRequestRef.current = null
      setError(null)
      setRetryCount(0)
    } catch (requestError) {
      const mapped = mapOnboardingError(requestError, step)
      setError(mapped)
      setRetryCount((count) => Math.min(count + 1, MAX_RETRY_ATTEMPTS))
    }
  }, [retryCount, step])

  return {
    handleRequest,
    retry,
    error,
    isRetryDisabled: retryCount >= MAX_RETRY_ATTEMPTS,
  }
}
