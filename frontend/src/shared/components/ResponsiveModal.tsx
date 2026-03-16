import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import type { ReactElement, ReactNode } from 'react'
import { Fragment } from 'react'
import { cn } from '../lib/cn'

export interface ResponsiveModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  className?: string
}

export function ResponsiveModal({
  children,
  footer,
  onClose,
  open,
  title,
  className,
}: ResponsiveModalProps): ReactElement {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={onClose}>
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
                  'rounded-t-[2rem] md:rounded-xl border border-ui-border',
                  'px-6 pb-8 pt-2 md:p-6',
                  className,
                )}
              >
                {/* Mobile Handle */}
                <div className="flex justify-center md:hidden pt-2 pb-4">
                  <div className="h-1 w-12 rounded-full bg-ui-border-strong opacity-40" />
                </div>

                {title ? (
                  <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground mb-4">
                    {title}
                  </DialogTitle>
                ) : null}

                <div className="space-y-4">{children}</div>

                {footer ? <div className="mt-6">{footer}</div> : null}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
