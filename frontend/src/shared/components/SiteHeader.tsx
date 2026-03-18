import { useState, useEffect, useRef, type ReactElement } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { KaizenLogo } from './KaizenLogo'
import { Button } from './Button'
import { useAuthState } from '../hooks/useAuthState'
import { useLogoutMutation } from '../../app/store/api/authApi'
import { cn } from '../lib/cn'
import { LogoutConfirmationModal } from './LogoutConfirmationModal'

/**
 * SiteHeader: The main navigation header.
 * Implements "natural" smart scroll behavior with a height-preserving wrapper
 * to prevent content overlap and layout shifts.
 */
export function SiteHeader(): ReactElement {
  const { isAuthenticated } = useAuthState()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const isDev = import.meta.env.DEV

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap()
      setIsLogoutModalOpen(false)
      setIsDrawerOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY

      // 1. At the very top: Reset to normal positioning
      if (currentScrollY <= 0) {
        setIsFixed(false)
        setIsVisible(true)
      }
      // 2. Beyond threshold (200px): Enable smart fixed behavior
      else if (currentScrollY > 200) {
        if (currentScrollY < lastScrollY.current) {
          // Scrolling UP: Show fixed header
          setIsFixed(true)
          setIsVisible(true)
        } else if (currentScrollY > lastScrollY.current + 5) {
          // Scrolling DOWN: Hide header
          setIsVisible(false)
        }
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    /* Wrapper preserves h-20 space in the document flow to prevent overlap */
    <div className="h-20 w-full">
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
            <div className="fixed inset-0 bg-black/18 transition-opacity" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                <TransitionChild
                  enter="transform transition ease-in-out duration-350"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-350"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-105 border-l border-ui-border">
                    <div className="flex h-full flex-col bg-background shadow-xl">
                      <div className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-ui-border-subtle bg-background px-5">
                        <Link
                          to="/"
                          className="flex items-center gap-3"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <KaizenLogo className="h-10 w-10 shrink-0" />
                          <span className="text-sm font-medium leading-none text-foreground">
                            Kaizen
                          </span>
                        </Link>
                        <button
                          type="button"
                          className="rounded-md p-2 text-foreground hover:bg-black/5 transition-colors"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <span className="sr-only">Close menu</span>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <line
                              x1="4"
                              y1="4"
                              x2="16"
                              y2="16"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <line
                              x1="16"
                              y1="4"
                              x2="4"
                              y2="16"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
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
                              className="flex items-center justify-between px-5 py-5 text-lg font-medium hover:bg-black/5 transition-colors text-foreground"
                              onClick={() => setIsDrawerOpen(false)}
                            >
                              {item.label}
                              <span className="text-muted-foreground">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path
                                    d="M7 5l5 5-5 5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </Link>
                          ))}
                          {isAuthenticated && (
                            <button
                              type="button"
                              className="flex items-center justify-between px-5 py-5 text-lg font-medium hover:bg-black/5 transition-colors text-foreground text-left w-full"
                              onClick={() => setIsLogoutModalOpen(true)}
                            >
                              Log out
                              <span className="text-muted-foreground">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path
                                    d="M7 5l5 5-5 5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </button>
                          )}
                        </nav>
                      </div>
                      {!isAuthenticated && (
                        <div className="border-t border-ui-border-subtle bg-background p-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                          <Link to="/signin" onClick={() => setIsDrawerOpen(false)}>
                            <Button variant="primary" className="w-full">
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

      {/* ───────── HEADER ───────── */}
      <header
        className={cn(
          'left-0 right-0 z-50 h-20 bg-background',
          isFixed
            ? 'fixed top-0 transition-transform duration-300 ease-in-out shadow-sm'
            : 'absolute top-0',
          isVisible ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-5 md:px-10">
          <NavLink
            to="/"
            end
            className="flex items-center gap-3 rounded-md text-foreground transition-opacity hover:opacity-90"
            aria-label="Kaizen home"
          >
            <KaizenLogo className="h-10 w-10 shrink-0" />
            <span className="text-sm font-medium leading-none text-foreground">Kaizen</span>
          </NavLink>

          <nav className="flex items-center" aria-label="Main navigation">
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to + item.label}
                  to={item.to}
                  end
                  className={({ isActive }): string => {
                    const isLinkActive = isActive && item.to.startsWith('/')
                    return [
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                      isLinkActive
                        ? 'bg-black/5 text-foreground'
                        : 'text-muted-foreground hover:bg-black/5 hover:text-foreground',
                    ].join(' ')
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-all text-muted-foreground hover:bg-black/5 hover:text-foreground"
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  Log out
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <NavLink to="/signin" className="ml-2">
                <Button variant="primary" className="px-3! py-1.5! border-none">
                  Sign in
                </Button>
              </NavLink>
            )}

            <button
              type="button"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-black/5 transition-colors"
              onClick={() => setIsDrawerOpen(true)}
              aria-expanded={isDrawerOpen}
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <line
                  x1="3"
                  y1="6"
                  x2="19"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="11"
                  x2="19"
                  y2="11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="16"
                  x2="19"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </nav>
        </div>
      </header>
    </div>
  )
}
