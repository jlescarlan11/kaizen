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

export interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
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

export function Modal({
  children,
  footer,
  initialFocus,
  onClose,
  open,
  title,
}: ModalProps): ReactElement {
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
          <DialogBackdrop className="fixed inset-0 bg-ui-bg/80" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-end justify-center px-4 pb-6 sm:items-center sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-6 sm:scale-95 sm:translate-y-0"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-6 sm:scale-95 sm:translate-y-0"
          >
            <DialogPanel className="w-full max-w-md space-y-4 rounded-t-3xl border border-ui-border bg-ui-surface p-6 text-foreground shadow-xl transition sm:rounded-xl sm:p-6">
              <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
                {title}
              </DialogTitle>
              {children}
              {footer}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
