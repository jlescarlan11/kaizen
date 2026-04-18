import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import {
  selectBalanceValue,
  selectFundingSourceType,
  setPendingBudgets,
} from '../onboarding/onboardingSlice'
import { getCategories } from '../categories/api'
import { resolveCategoryDesign } from '../categories/designSystem'
import { SMART_BUDGET_PERIOD, SMART_BUDGET_SLOTS } from './constants'
import type { BudgetPeriod } from './constants'
import { useCompleteOnboardingMutation } from '../../app/store/api/authApi'
import { useSaveSmartBudgetsMutation, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { BudgetTooltip } from './BudgetTooltip'
import { AllocationTotalDisplay } from './components/AllocationTotalDisplay'
import { BudgetPeriodSelector } from './components/BudgetPeriodSelector'
import { SkipBudgetTrigger } from './components/SkipBudgetTrigger'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'

export function SmartBudgetPage(): ReactElement | null {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [complete, { isLoading: isSavingOnboarding }] = useCompleteOnboardingMutation()
  const [saveSmartBudgets, { isLoading: isSavingBudgets }] = useSaveSmartBudgetsMutation()
  const { data: budgetSummary } = useGetBudgetSummaryQuery()

  const reduxBalance = useAppSelector(selectBalanceValue)
  const fundingSourceType = useAppSelector(selectFundingSourceType)
  const balance = reduxBalance ?? user?.balance ?? 0

  const isSaving = isSavingOnboarding || isSavingBudgets

  const formattedBalance = formatCurrency(balance)

  const [amounts, setAmounts] = useState(() =>
    SMART_BUDGET_SLOTS.map((slot) => (balance * slot.percentage).toFixed(2)),
  )
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [categoryIcons, setCategoryIcons] = useState<string[]>([])
  const [categoryColors, setCategoryColors] = useState<string[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isOverAllocated, setIsOverAllocated] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(SMART_BUDGET_PERIOD)

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

        const selectedIds: number[] = []
        const selectedNames: string[] = []
        const selectedIcons: string[] = []
        const selectedColors: string[] = []
        let missingCategory = false

        for (const slot of SMART_BUDGET_SLOTS) {
          const matched = defaultCategories.find(
            (c) => c.name.toLowerCase() === slot.categoryName.toLowerCase(),
          )
          if (matched) {
            selectedIds.push(matched.id)
            selectedNames.push(matched.name)
            selectedIcons.push(matched.icon)
            selectedColors.push(matched.color)
          } else {
            missingCategory = true
            break
          }
        }

        if (missingCategory) {
          setCategoryError('Insufficient global categories to suggest budgets.')
          setCategoryIds([])
          setCategoryNames([])
          setCategoryIcons([])
          setCategoryColors([])
        } else {
          setCategoryIds(selectedIds)
          setCategoryNames(selectedNames)
          setCategoryIcons(selectedIcons)
          setCategoryColors(selectedColors)
        }
      })
      .catch(() => {
        if (!mounted) return
        setCategoryError('Unable to load category guidance.')
        setCategoryIds([])
        setCategoryNames([])
        setCategoryIcons([])
        setCategoryColors([])
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

    const budgetsToSave = SMART_BUDGET_SLOTS.map((_, index) => ({
      categoryId: categoryIds[index],
      categoryName: categoryNames[index],
      categoryIcon: categoryIcons[index] ?? resolveCategoryDesign(categoryNames[index]).icon,
      categoryColor: categoryColors[index] ?? resolveCategoryDesign(categoryNames[index]).color,
      amount: parsedAmounts[index]!,
      period: selectedPeriod,
    }))

    try {
      if (user && !user.onboardingCompleted) {
        // During onboarding, we just save everything at once when finishing
        dispatch(setPendingBudgets(budgetsToSave))
        if (!fundingSourceType) {
          setServerError('Choose a funding source before finishing onboarding.')
          return
        }
        await complete({
          startingFunds: balance,
          fundingSourceType,
          budgets: budgetsToSave,
        }).unwrap()
        navigate('/', { replace: true })
      } else {
        // After onboarding, we save the batch directly
        await saveSmartBudgets({ budgets: budgetsToSave }).unwrap()
        navigate('/budget', { replace: true })
      }
    } catch (error) {
      console.error('Smart budget save failed:', error)
      setServerError('Unable to save suggested budgets. Please try again.')
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
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
              <Card key={slot.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{slot.categoryName}</p>
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
          <div className="rounded-2xl border border-ui-border-subtle p-4">
            <BudgetPeriodSelector
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              referenceAmount={totalAllocation}
            />
          </div>

          <div className="rounded-2xl border border-ui-border-subtle p-4">
            {/* Instruction 4 integration slot: render the allocation total display here. */}
            <AllocationTotalDisplay
              totalAllocated={totalAllocation}
              availablePoolBalance={selectedPeriod === 'MONTHLY' ? (budgetSummary?.availableMonthly ?? 0) : (budgetSummary?.availableWeekly ?? 0)}
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
                isOverAllocated
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
