import { useSyncExternalStore } from 'react'

/**
 * Custom hook that tracks the state of a media query.
 * Uses useSyncExternalStore for efficient, tear-free subscription to the media query state.
 *
 * @param query The media query to track (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') {
        return () => {}
      }
      const media = window.matchMedia(query)
      media.addEventListener('change', callback)
      return () => media.removeEventListener('change', callback)
    },
    () => {
      if (typeof window !== 'undefined') {
        return window.matchMedia(query).matches
      }
      return false
    },
    () => false, // Server-side snapshot
  )
}
