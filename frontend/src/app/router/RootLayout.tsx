import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Outlet, useLocation, useNavigate, useMatches } from 'react-router-dom'
import { MainContent } from '../../shared/components/MainContent'
import { SiteFooter } from '../../shared/components/SiteFooter'
import { SiteHeader } from '../../shared/components/SiteHeader'
import { UndoSnackbar } from '../../shared/components/UndoSnackbar'
import { Button } from '../../shared/components/Button'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { cn } from '../../shared/lib/cn'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import { useLogoutMutation } from '../store/api/authApi'
import { goToPreviousStep, resetOnboardingState } from '../../features/onboarding/onboardingSlice'
import { clearStoredOnboardingDraft } from '../../features/onboarding/onboardingDraftStorage'
import {
  ONBOARDING_STEP_ORDER,
  type OnboardingStep,
  ROUTE_TO_ONBOARDING_STEP,
} from '../../features/onboarding/onboardingStep'

interface RouteHandle {
  backButton?: {
    label: string
    fallbackPath: string
  }
}

/**
 * RootLayout: The main application shell.
 * Uses modular SiteHeader, SiteFooter, and MainContent components.
 */
export function RootLayout(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const matches = useMatches()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [headerOffset, setHeaderOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const lastScrollY = useRef(0)

  const isSigninPage = location.pathname === '/signin'
  const isOnboardingPage = location.pathname.startsWith('/onboarding')

  // Extract navigation metadata from the current route match
  const lastMatch = matches[matches.length - 1]
  const handle = lastMatch?.handle as RouteHandle | undefined
  const backButtonConfig = handle?.backButton
  const onboardingSteps = ONBOARDING_STEP_ORDER.filter(
    (step): step is Exclude<OnboardingStep, 'COMPLETE'> => step !== 'COMPLETE',
  )
  const activeOnboardingStep = (() => {
    if (!isOnboardingPage) {
      return undefined
    }

    const step = ROUTE_TO_ONBOARDING_STEP[location.pathname]
    return step && step !== 'COMPLETE' ? step : undefined
  })()
  const activeOnboardingStepIndex = activeOnboardingStep
    ? onboardingSteps.indexOf(activeOnboardingStep)
    : -1
  const onboardingStepLabel =
    activeOnboardingStepIndex >= 0
      ? `Step ${activeOnboardingStepIndex + 1} of ${onboardingSteps.length}`
      : null

  useEffect(() => {
    if (!backButtonConfig) {
      Promise.resolve().then(() => {
        setHeaderOffset(0)
        setIsAnimating(false)
      })
      lastScrollY.current = 0
      return
    }

    const handleScroll = (): void => {
      const currentScrollY = Math.max(0, window.scrollY)
      const isScrollingUp = currentScrollY < lastScrollY.current

      if (currentScrollY <= 80) {
        if (currentScrollY === 0) {
          setHeaderOffset(0)
          setIsAnimating(false)
        } else if (isScrollingUp && headerOffset === 0) {
          setHeaderOffset(0)
          setIsAnimating(true)
        } else {
          setHeaderOffset(-currentScrollY)
          setIsAnimating(false)
        }
      } else if (currentScrollY < lastScrollY.current - 5) {
        setHeaderOffset(0)
        setIsAnimating(true)
      } else if (currentScrollY > lastScrollY.current + 5) {
        setHeaderOffset(-80)
        setIsAnimating(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [backButtonConfig, headerOffset])

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap()
      if (user) {
        clearStoredOnboardingDraft(user.id)
      }
      dispatch(resetOnboardingState())
      setIsLogoutModalOpen(false)
      navigate('/signin', { replace: true })
    } catch (error) {
      console.error('Logout failed', error)
      // Force client-side cleanup even if server-side fails
      if (user) {
        clearStoredOnboardingDraft(user.id)
      }
      dispatch(logout())
      dispatch(resetOnboardingState())
      setIsLogoutModalOpen(false)
      navigate('/signin', { replace: true })
    }
  }

  const handleBack = (): void => {
    if (!backButtonConfig) {
      return
    }

    if (backButtonConfig.label === 'Logout') {
      setIsLogoutModalOpen(true)
      return
    }

    if (isOnboardingPage && backButtonConfig.label === 'Back') {
      dispatch(goToPreviousStep())
    }

    if (backButtonConfig.fallbackPath) {
      navigate(backButtonConfig.fallbackPath, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {backButtonConfig ? (
        <>
          <div className="h-20 w-full shrink-0" />
          <header
            className={cn(
              'fixed top-0 left-0 right-0 z-50 h-20 bg-background/95 px-5 backdrop-blur-md md:px-10',
              isAnimating && 'transition-transform duration-200 ease-in-out',
            )}
            style={{ transform: `translateY(${headerOffset}px)` }}
          >
            <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between gap-4">
              <Button
                variant="ghost"
                className="group flex items-center gap-2 px-0 text-foreground hover:bg-transparent"
                onClick={handleBack}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="transition-transform group-hover:-translate-x-1"
                >
                  <path
                    d="M15.8333 10H4.16667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 15.8333L4.16667 10L10 4.16667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">{backButtonConfig.label}</span>
              </Button>

              {onboardingStepLabel ? (
                <p className="text-sm font-medium leading-6 text-muted-foreground">
                  {onboardingStepLabel}
                </p>
              ) : null}
            </div>
          </header>
        </>
      ) : (
        !isOnboardingPage && <SiteHeader />
      )}

      <MainContent density={isSigninPage || isOnboardingPage ? 'compact' : 'standard'}>
        <Outlet />
      </MainContent>

      {!backButtonConfig && !isSigninPage && !isOnboardingPage && <SiteFooter />}
      <UndoSnackbar />
    </div>
  )
}
