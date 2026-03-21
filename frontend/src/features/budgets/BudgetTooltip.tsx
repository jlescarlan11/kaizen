import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'

import { SMART_BUDGET_LEARN_MORE_TARGET } from './helpTargets'

interface BudgetTooltipProps {
  percentageValue: number
}

export function BudgetTooltip({ percentageValue }: BudgetTooltipProps) {
  const percentageLabel = Math.round(percentageValue * 100)
  const learnMoreHref = SMART_BUDGET_LEARN_MORE_TARGET || undefined
  const linkReady = Boolean(learnMoreHref)

  return (
    <Popover className="relative inline-block text-left">
      <Popover.Button
        type="button"
        className="h-8 w-8 rounded-full border border-ui-border-subtle bg-ui-surface-muted text-muted-foreground transition hover:border-ui-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        aria-label={`Budget guidance for ${percentageLabel}% slot`}
      >
        <span className="text-sm font-semibold">i</span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-120"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-95"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-ui-border shadow-xl bg-ui-surface p-4 text-left">
          <p className="text-sm font-medium text-foreground">Budget guidance</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on recommended budgeting guidelines — this slot reserves {percentageLabel}% of
            your balance.
          </p>
          <a
            href={learnMoreHref}
            target={linkReady ? '_blank' : undefined}
            rel={linkReady ? 'noreferrer' : undefined}
            className={`mt-3 block text-sm font-medium ${linkReady ? 'text-primary' : 'text-muted-foreground opacity-60 cursor-not-allowed'}`}
            onClick={(event) => {
              if (!linkReady) {
                event.preventDefault()
              }
            }}
            aria-disabled={!linkReady}
          >
            Learn more
          </a>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
