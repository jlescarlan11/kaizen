import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import { Fragment, useId, useState, type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { formFieldClasses } from '../styles/form'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface SelectProps {
  id?: string
  label: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  placeholder?: string
  className?: string
  name?: string
  disabled?: boolean
}

export function Select({
  className,
  defaultValue,
  error,
  helperText,
  id,
  label,
  options,
  placeholder = 'Select an option',
  value: controlledValue,
  onChange,
  name,
  disabled,
}: SelectProps): ReactElement {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined
  const helperId = helperText && !error ? `${selectId}-helper` : undefined
  const describedBy = error ? errorId : helperId

  // Internal state for uncontrolled behavior
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  // Use controlled value if provided, otherwise fallback to internal state
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  function handleValueChange(newValue: string) {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  // Find the currently selected option
  const selectedOption = options.find((opt) => opt.value === currentValue)

  return (
    <div className={formFieldClasses.container}>
      <Listbox value={currentValue} onChange={handleValueChange} name={name} disabled={disabled}>
        {({ open }) => (
          <>
            <ListboxLabel className={formFieldClasses.label}>{label}</ListboxLabel>
            <div className="relative">
              <ListboxButton
                id={selectId}
                aria-describedby={describedBy}
                aria-invalid={error ? 'true' : undefined}
                className={cn(
                  formFieldClasses.input,
                  'flex items-center justify-between text-left',
                  !selectedOption && 'text-subtle-foreground',
                  error && 'border-ui-danger focus-visible:ring-ui-danger/22',
                  disabled && 'opacity-50 cursor-not-allowed bg-ui-surface-muted',
                  className,
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {selectedOption?.icon && (
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-foreground/70">
                      {selectedOption.icon}
                    </span>
                  )}
                  <span className="block truncate">{selectedOption?.label ?? placeholder}</span>
                </span>
                <span className="pointer-events-none flex items-center pr-2 text-foreground/50">
                  <ChevronDownIcon />
                </span>
              </ListboxButton>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-ui-border bg-ui-surface p-1 shadow-xl focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ focus, selected }) =>
                        cn(
                          'relative select-none transition-colors',
                          option.disabled
                            ? 'cursor-default opacity-100 py-1.5 pl-4 mt-2 mb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground'
                            : 'cursor-pointer rounded-lg py-3 pl-12 pr-4 text-foreground',
                          !option.disabled && focus ? 'bg-ui-surface-muted' : '',
                          !option.disabled && selected
                            ? 'bg-ui-surface-subtle font-semibold'
                            : 'font-normal',
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={cn('block truncate', selected ? 'font-semibold' : 'font-normal')}
                          >
                            {option.label}
                          </span>
                          {!option.disabled && (selected || option.icon) ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-foreground">
                              <span className="flex h-[18px] w-[18px] items-center justify-center">
                                {selected ? <CheckIcon /> : option.icon}
                              </span>
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Listbox>

      {helperText && !error ? (
        <p id={helperId} className={formFieldClasses.helper}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={formFieldClasses.error}>
          {error}
        </p>
      ) : null}
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
