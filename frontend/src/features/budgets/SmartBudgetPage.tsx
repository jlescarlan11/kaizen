import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { getCategories } from '../categories/api'
import { SMART_BUDGET_PERIOD, SMART_BUDGET_SLOTS } from './constants'
import type { BudgetPeriod } from './constants'
import { useSaveSmartBudgetsMutation } from '../../app/store/api/budgetApi'
import { BudgetTooltip } from './BudgetTooltip'
import { AllocationTotalDisplay } from './components/AllocationTotalDisplay'
import { BudgetPeriodSelector } from './components/BudgetPeriodSelector'
import { SkipBudgetTrigger } from './components/SkipBudgetTrigger'

export function SmartBudgetPage(): ReactElement | null {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const balance = user?.openingBalance ?? 0
  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(balance)

  const [amounts, setAmounts] = useState(() =>
    SMART_BUDGET_SLOTS.map((slot) => (balance * slot.percentage).toFixed(2)),
  )
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isOverAllocated, setIsOverAllocated] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(SMART_BUDGET_PERIOD)
  const [saveSmartBudgets, { isLoading: isSaving }] = useSaveSmartBudgetsMutation()

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setAmounts(SMART_BUDGET_SLOTS.map((slot) => (balance * slot.percentage).toFixed(2)))
  }, [balance])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let mounted = true
    setCategoryLoading(true)
    setCategoryError(null)

    getCategories()
      .then((fetched) => {
        if (!mounted) return
        const defaultCategories = fetched.filter((category) => category.isGlobal)
        if (defaultCategories.length < SMART_BUDGET_SLOTS.length) {
          setCategoryError('Insufficient global categories to suggest budgets.')
          setCategoryIds([])
        } else {
          const selectedIds = defaultCategories
            .slice(0, SMART_BUDGET_SLOTS.length)
            .map((category) => category.id)
          setCategoryIds(selectedIds)
        }
      })
      .catch(() => {
        if (!mounted) return
        setCategoryError('Unable to load category guidance.')
        setCategoryIds([])
      })
      .finally(() => {
        if (!mounted) return
        setCategoryLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const parsedAmounts = useMemo(
    () =>
      amounts.map((amount) => {
        const parsed = parseFloat(amount)
        return Number.isNaN(parsed) ? null : parsed
      }),
    [amounts],
  )

  const hasValidAmounts = parsedAmounts.every((value) => value !== null)
  const totalAllocation = parsedAmounts.reduce<number>((sum, next) => sum + (next ?? 0), 0)

  const handleAmountChange = (index: number, value: string) => {
    setAmounts((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    if (serverError) {
      setServerError(null)
    }
  }

  const isOverAllocationBlocked = isOverAllocated
  // PRD Open Question 2: switch to a soft warning + confirmation step instead of disabling the submit button when this resolves differently.

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !hasValidAmounts ||
      categoryIds.length < SMART_BUDGET_SLOTS.length ||
      parsedAmounts.some((value) => value === null)
    ) {
      return
    }

    setServerError(null)

    const payload = {
      budgets: SMART_BUDGET_SLOTS.map((_, index) => ({
        categoryId: categoryIds[index],
        amount: parsedAmounts[index]!,
        period: selectedPeriod,
      })),
    }

    try {
      await saveSmartBudgets(payload).unwrap()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Smart budget save failed:', error)
      setServerError('Unable to save suggested budgets. Please try again.')
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Smart Budget Allocation
        </h1>
        <p className="text-sm text-muted-foreground">
          Adjust your suggested allocations before confirming. Balance used for the calculation:{' '}
          <span className="font-semibold text-foreground">{formattedBalance}</span>
        </p>
      </header>

      <Card className="space-y-4 p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {SMART_BUDGET_SLOTS.map((slot, index) => {
            const value = amounts[index]
            const parsed = parsedAmounts[index]
            const showError = value.trim() !== '' && parsed === null
            return (
              <Card
                key={slot.id}
                className="flex flex-col gap-3 border border-ui-border-subtle p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{slot.placeholderLabel}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-tight">
                      {Math.round(slot.percentage * 100)}% of balance
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <BudgetTooltip percentageValue={slot.percentage} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Input
                    label="Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    endAdornment="PHP"
                    helperText="Inline edits stay on this screen."
                    value={value}
                    onChange={(event) => handleAmountChange(index, event.target.value)}
                    error={showError ? 'Enter a valid amount.' : undefined}
                  />
                </div>
              </Card>
            )
          })}

          {/* Instruction 5 integration slot: period selector mounts here. */}
          <div className="rounded-2xl border border-ui-border-subtle bg-ui-surface-subtle/60 p-4">
            <BudgetPeriodSelector
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              referenceAmount={totalAllocation}
            />
          </div>

          <div className="rounded-2xl border border-ui-border-subtle bg-ui-surface-subtle/60 p-4">
            {/* Instruction 4 integration slot: render the allocation total display here. */}
            <AllocationTotalDisplay
              totalAllocated={totalAllocation}
              balance={balance}
              onStatusChange={(status) => setIsOverAllocated(status === 'over')}
            />
          </div>

          {categoryError ? (
            <p className="text-sm text-destructive" role="alert">
              {categoryError}
            </p>
          ) : null}
          {serverError ? (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                !hasValidAmounts ||
                isSaving ||
                categoryIds.length < SMART_BUDGET_SLOTS.length ||
                isOverAllocationBlocked
              }
            >
              Save suggestions
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/budget/manual')}
              className="text-sm font-medium"
            >
              Switch to manual setup
            </Button>
          </div>

          {/* Instruction 6 placement stub (PRD Open Question 5) — confirm whether Skip belongs on this screen before finalizing placement. */}
          <div className="flex justify-end text-sm">
            <SkipBudgetTrigger />
          </div>
        </form>
      </Card>

      {categoryLoading && (
        <p className="text-sm text-muted-foreground">
          Loading categories for allocation guidance...
        </p>
      )}
    </section>
  )
}
