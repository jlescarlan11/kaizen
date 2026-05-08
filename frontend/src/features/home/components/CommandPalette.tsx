import React, { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { useAppDispatch } from '../../../app/store/hooks'
import { togglePrivacyMode } from '../../../app/store/uiSlice'

export function CommandPalette(): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const actions = [
    {
      id: 'add',
      title: 'Add Transaction',
      icon: 'plus',
      shortcut: 'T',
      action: () => navigate('/transactions/add'),
    },
    {
      id: 'privacy',
      title: 'Toggle Privacy Mode',
      icon: 'wifi-off',
      shortcut: 'P',
      action: () => dispatch(togglePrivacyMode()),
    },
    {
      id: 'home',
      title: 'Go to Dashboard',
      icon: 'wallet',
      shortcut: 'H',
      action: () => navigate('/'),
    },
    {
      id: 'search',
      title: 'Search Transactions',
      icon: 'search',
      shortcut: 'S',
      action: () => navigate('/transactions'),
    },
    {
      id: 'settings',
      title: 'Account Settings',
      icon: 'edit',
      shortcut: ',',
      action: () => navigate('/your-account'),
    },
  ]

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase()),
  )

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
    setQuery('')
  }

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto max-w-2xl transform divide-y divide-border/5 overflow-hidden rounded-[2rem] bg-surface shadow-2xl ring-1 ring-border/10 transition-all">
              <div className="relative">
                <SharedIcon
                  type="ui"
                  name="search"
                  className="pointer-events-none absolute left-6 top-5 h-5 w-5 text-text-tertiary"
                  size={20}
                />
                <input
                  type="text"
                  className="h-14 w-full border-0 bg-transparent pl-14 pr-4 text-text-primary placeholder:text-text-tertiary focus:ring-0 sm:text-sm font-bold uppercase tracking-widest"
                  placeholder="Command Palette..."
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredActions.length > 0) {
                      handleAction(filteredActions[0].action)
                    }
                  }}
                />
              </div>

              {filteredActions.length > 0 && (
                <div className="max-h-96 overflow-y-auto p-4 space-y-1">
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.action)}
                      className="group flex w-full items-center justify-between rounded-xl p-4 text-left hover:bg-surface-secondary transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-surface-secondary flex items-center justify-center text-text-tertiary group-hover:bg-surface group-hover:text-primary transition-colors">
                          <SharedIcon type="ui" name={action.icon} size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-widest text-text-primary group-hover:text-surface transition-colors">
                            {action.title}
                          </p>
                        </div>
                      </div>
                      <kbd className="hidden sm:inline-block rounded border border-border/10 px-2 py-1 text-[10px] font-black text-text-tertiary group-hover:border-surface/20 group-hover:text-surface/60 transition-all">
                        {action.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              )}

              {query !== '' && filteredActions.length === 0 && (
                <div className="p-10 text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-text-tertiary opacity-40">
                    No commands found.
                  </p>
                </div>
              )}

              <div className="bg-surface-secondary/50 px-6 py-3 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary opacity-40">
                  Kaizen Power Tools
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-bold text-text-tertiary uppercase">
                    ↑↓ to navigate
                  </span>
                  <span className="text-[9px] font-bold text-text-tertiary uppercase">
                    ↵ to execute
                  </span>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
