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
  required?: boolean
  'aria-label'?: string
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
  required,
  'aria-label': ariaLabel,
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
            <ListboxLabel className={formFieldClasses.label}>
              {label}
              {required ? (
                <span aria-hidden="true" className="ml-0.5 text-error">
                  *
                </span>
              ) : null}
            </ListboxLabel>
            <div className="relative">
              <ListboxButton
                id={selectId}
                aria-describedby={describedBy}
                aria-invalid={error ? 'true' : undefined}
                aria-label={ariaLabel}
                className={cn(
                  formFieldClasses.input,
                  'flex items-center justify-between text-left',
                  !selectedOption && 'text-text-secondary opacity-40',
                  error && 'border-error/50 focus-visible:ring-error/10',
                  disabled && 'opacity-50 cursor-not-allowed bg-surface-secondary',
                  className,
                )}
              >
                <span className="flex items-center gap-3 truncate">
                  {selectedOption?.icon && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-text-secondary">
                      {selectedOption.icon}
                    </span>
                  )}
                  <span className="block truncate">{selectedOption?.label ?? placeholder}</span>
                </span>
                <span className="pointer-events-none flex items-center pr-2 text-text-secondary/40">
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
                <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border-subtle bg-white p-2 shadow-2xl focus:outline-none">
                  {options.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ focus, selected }) =>
                        cn(
                          'relative select-none transition-all duration-200',
                          option.disabled
                            ? 'cursor-default opacity-100 py-2 pl-4 mt-3 mb-1 text-3xs font-black uppercase tracking-[0.2em] text-text-secondary opacity-40'
                            : 'cursor-pointer rounded-xl py-3.5 pl-12 pr-4 text-sm font-black tracking-tight text-text-primary uppercase',
                          !option.disabled && focus ? 'bg-surface-secondary' : '',
                          !option.disabled && selected
                            ? 'bg-primary/10 text-primary font-semibold'
                            : '',
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={cn('block truncate')}>{option.label}</span>
                          {!option.disabled && (selected || option.icon) ? (
                            <span
                              className={cn(
                                'absolute inset-y-0 left-0 flex items-center pl-4',
                                selected ? 'text-text-primary' : 'text-text-secondary',
                              )}
                            >
                              <span className="flex h-5 w-5 items-center justify-center">
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
