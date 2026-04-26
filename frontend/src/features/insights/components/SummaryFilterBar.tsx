import type { ReactElement } from 'react'
import { Checkbox } from '../../../shared/components/Checkbox'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { cn } from '../../../shared/lib/cn'

interface Account {
  id: number
  name: string
}

interface SummaryFilterBarProps {
  selectedAccountIds: number[]
  onAccountSelectionChange: (ids: number[]) => void
  accounts: Account[]
}

export function SummaryFilterBar({
  selectedAccountIds,
  onAccountSelectionChange,
  accounts,
}: SummaryFilterBarProps): ReactElement {
  const handleAccountToggle = (id: number) => {
    if (selectedAccountIds.includes(id)) {
      onAccountSelectionChange(selectedAccountIds.filter((accountId) => accountId !== id))
    } else {
      onAccountSelectionChange([...selectedAccountIds, id])
    }
  }

  const selectedAccountsCount = selectedAccountIds.length
  const accountsLabel =
    selectedAccountsCount === 0
      ? 'All Accounts'
      : selectedAccountsCount === 1
        ? accounts.find((a) => a.id === selectedAccountIds[0])?.name
        : `${selectedAccountsCount} Accounts Selected`

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground ml-1">
        Account Filter
      </label>
      <Popover className="relative">
        {({ open }) => (
          <>
            <PopoverButton className="flex items-center justify-between w-full px-4 py-2.5 text-left bg-ui-surface border border-ui-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-ui-surface-hover shadow-sm hover:shadow-md">
              <span className="truncate">{accountsLabel}</span>
              <ChevronDownIcon />
            </PopoverButton>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel className="absolute z-50 mt-2 right-0 w-64 p-2 bg-ui-surface border border-ui-border rounded-2xl shadow-2xl focus:outline-none">
                <div className="max-h-60 overflow-auto space-y-1 p-1">
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-ui-surface-hover transition-colors',
                      selectedAccountIds.length === 0 && 'bg-ui-surface-subtle',
                    )}
                    onClick={() => onAccountSelectionChange([])}
                  >
                    <Checkbox
                      id="all-accounts"
                      checked={selectedAccountIds.length === 0}
                      onChange={() => onAccountSelectionChange([])}
                      label="All Accounts"
                    />
                  </div>
                  <div className="h-px bg-ui-border my-1" />
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-ui-surface-hover transition-colors',
                        selectedAccountIds.includes(account.id) && 'bg-ui-surface-subtle',
                      )}
                      onClick={() => handleAccountToggle(account.id)}
                    >
                      <Checkbox
                        id={`account-${account.id}`}
                        checked={selectedAccountIds.includes(account.id)}
                        onChange={() => handleAccountToggle(account.id)}
                        label={account.name}
                      />
                    </div>
                  ))}
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-subtle-foreground"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
