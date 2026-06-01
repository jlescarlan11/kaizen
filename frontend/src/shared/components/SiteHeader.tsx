import { useState, type ReactElement } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { KaizenLogo } from './KaizenLogo'
import { Button } from './Button'
import { useAuthState } from '../hooks/useAuthState'
import { useLogoutMutation } from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from './LogoutConfirmationModal'
import { cn } from '../lib/cn'
import { clearStoredOnboardingDraft } from '../../features/onboarding/onboardingDraftStorage'

/**
 * SiteHeader: The main navigation header.
 * Implements "reveal-on-scroll-up" behavior using a sticky header
 * and translate transitions.
 */
export function SiteHeader(): ReactElement {
  const { isAuthenticated, user } = useAuthState()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const isDev = import.meta.env.DEV

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap()
      if (user) {
        clearStoredOnboardingDraft(user.id)
      }
      setIsLogoutModalOpen(false)
      setIsDrawerOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const navItems = isAuthenticated
    ? [
        { label: 'Home', to: '/' },
        { label: 'Playground', to: '/playground' },
      ]
    : [
        { label: 'Platform', to: '#' },
        { label: 'Help', to: '#' },
        ...(isDev ? [{ label: 'Playground', to: '/playground' }] : []),
      ]

  return (
    <>
      {/* ───────── MOBILE DRAWER ───────── */}
      <Transition show={isDrawerOpen}>
        <Dialog as="div" className="relative z-50" onClose={setIsDrawerOpen}>
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                <TransitionChild
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md border-l border-border-subtle">
                    <div className="flex h-full flex-col bg-background shadow-2xl">
                      <div className="relative z-10 flex h-24 shrink-0 items-center justify-between border-b border-border-subtle bg-background px-6">
                        <Link
                          to="/"
                          className="flex items-center gap-3"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <KaizenLogo className="h-10 w-10 shrink-0" />
                          <span className="text-xl font-black tracking-tighter text-text-primary uppercase">
                            Kaizen
                          </span>
                        </Link>
                        <button
                          type="button"
                          className="rounded-2xl p-2.5 text-text-primary hover:bg-surface-secondary transition-colors"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <span className="sr-only">Close menu</span>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto pt-4 pb-8">
                        <nav className="flex flex-col gap-1">
                          {navItems.map((item) => (
                            <Link
                              key={item.to + item.label}
                              to={item.to}
                              className="flex items-center justify-between px-6 py-5 text-xl font-black hover:bg-surface-secondary transition-colors text-text-primary tracking-tight"
                              onClick={() => setIsDrawerOpen(false)}
                            >
                              {item.label}
                              <span className="text-text-secondary">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="m9 18 6-6-6-6"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </Link>
                          ))}
                        </nav>
                      </div>
                      {!isAuthenticated && (
                        <div className="border-t border-border-subtle bg-background p-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
                          <Link to="/signin" onClick={() => setIsDrawerOpen(false)}>
                            <Button
                              variant="primary"
                              className="w-full h-14 rounded-2xl font-black text-lg"
                            >
                              Sign in
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      <div className="h-24 w-full shrink-0" />

      {/* ───────── HEADER ───────── */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-background/80 backdrop-blur-md shrink-0 z-50 px-6 md:px-10 border-b border-border/5">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">
          <NavLink
            to="/"
            end
            className="flex items-center gap-3 rounded-md text-text-primary transition-opacity hover:opacity-90"
            aria-label="Kaizen home"
          >
            <KaizenLogo className="h-10 w-10 shrink-0" />
            <span className="text-2xl font-black tracking-tighter text-text-primary uppercase">
              Kaizen
            </span>
          </NavLink>

          <nav className="flex items-center" aria-label="Main navigation">
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to + item.label}
                  to={item.to}
                  end
                  className={({ isActive }): string => {
                    const isLinkActive = isActive && item.to.startsWith('/')
                    return cn(
                      'rounded-xl px-4 py-2 text-sm font-black transition-all tracking-tight',
                      isLinkActive
                        ? 'bg-surface-secondary text-text-primary'
                        : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
                    )
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {!isAuthenticated && (
              <NavLink to="/signin" className="ml-4">
                <Button
                  variant="primary"
                  className="px-6 py-2 h-11 border-none font-black tracking-tight rounded-xl"
                >
                  Sign in
                </Button>
              </NavLink>
            )}

            <button
              type="button"
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-2xl text-text-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsDrawerOpen(true)}
              aria-expanded={isDrawerOpen}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </nav>
        </div>
      </header>
    </>
  )
}
