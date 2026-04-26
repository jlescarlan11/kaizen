import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import type { MutableRefObject, ReactElement, ReactNode } from 'react'
import { Fragment } from 'react'
import { cn } from '../lib/cn'

export interface ResponsiveModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  className?: string
  /**
   * Optional ref forwarded to Headless UI's `initialFocus` prop.
   *
   * Headless UI manages focus trap and restoration. Pass `initialFocus` to
   * choose which element receives focus on open; defaults to the first
   * focusable element. Focus returns to the trigger on close automatically.
   *
   * Forms inside a Modal should call onClose() in the success branch of their
   * submit handler — the modal does not auto-close on success.
   */
  initialFocus?: MutableRefObject<HTMLElement | null>
}

export function ResponsiveModal({
  children,
  footer,
  initialFocus,
  onClose,
  open,
  title,
  className,
}: ResponsiveModalProps): ReactElement {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={onClose} initialFocus={initialFocus}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-ui-bg/80 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center md:items-center p-0 md:p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
            >
              <DialogPanel
                className={cn(
                  'relative w-full max-w-md transform overflow-hidden bg-ui-surface text-left align-middle shadow-xl transition-all',
                  'rounded-t-4xl md:rounded-xl border border-ui-border',
                  'flex flex-col max-h-[75vh] md:max-h-[90vh]',
                  className,
                )}
              >
                {/* Mobile Handle */}
                <div className="flex justify-center md:hidden pt-3 pb-2 shrink-0">
                  <div className="h-1.5 w-12 rounded-full bg-ui-border-strong opacity-20" />
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2 md:p-6">
                  {title ? (
                    <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground mb-4">
                      {title}
                    </DialogTitle>
                  ) : null}

                  <div className="space-y-4">{children}</div>

                  {footer ? <div className="mt-6">{footer}</div> : null}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
