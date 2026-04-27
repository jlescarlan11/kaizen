import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Input } from '../../shared/components/Input'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import {
  selectBalanceValue,
  selectFundingSourceType,
  addPendingBudget,
  selectPendingBudgets,
  removePendingBudget,
  updatePendingBudget,
  type PendingBudget,
  setPendingBudgets,
} from '../onboarding/onboardingSlice'
import { createCategory, getCategories } from '../categories/api'
import { BudgetCard } from './components/BudgetCard'
import { InlineCustomCategoryFields } from '../categories/InlineCustomCategoryFields'
import {
  getAutoAssignedCategoryDesign,
  type CategoryIconName,
  resolveCategoryDesign,
} from '../categories/designSystem'
import type { Category } from '../categories/types'
import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  ManualBudgetCategoryPicker,
} from './ManualBudgetCategoryPicker'
import { SMART_BUDGET_PERIOD } from './constants'
import type { BudgetPeriod } from './constants'
import { BudgetPeriodSelector } from './components/BudgetPeriodSelector'
import { SkipBudgetTrigger } from './components/SkipBudgetTrigger'
import { useCompleteOnboardingMutation } from '../../app/store/api/authApi'
import { useGetBudgetsQuery, useSaveSmartBudgetsMutation } from '../../app/store/api/budgetApi'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { getErrorMessage } from '../../app/store/api/errors'

export function ManualBudgetSetupPage(): ReactElement | null {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [complete, { isLoading: isCompleting }] = useCompleteOnboardingMutation()
  const [saveBatch, { isLoading: isSavingBatch }] = useSaveSmartBudgetsMutation()
  const { data: existingBudgets, isLoading: isLoadingBudgets } = useGetBudgetsQuery()

  const reduxBalance = useAppSelector(selectBalanceValue)
  const fundingSourceType = useAppSelector(selectFundingSourceType)
  const balance = reduxBalance ?? user?.balance ?? 0

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | '' | typeof CUSTOM_CATEGORY_OPTION_VALUE
  >('')
  const [amountInput, setAmountInput] = useState('')
  const [categoryValidationError, setCategoryValidationError] = useState<string | null>(null)
  const [amountValidationError, setAmountValidationError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const [customCategoryIcon, setCustomCategoryIcon] = useState<CategoryIconName>('home')
  const [customCategoryColor, setCustomCategoryColor] = useState('#1d4ed8')
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(null)
  const [isCreatingCustomCategory, setIsCreatingCustomCategory] = useState(false)

  const sessionBudgets = useAppSelector(selectPendingBudgets)
  const hasHydratedRef = useRef(false)

  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(SMART_BUDGET_PERIOD)

  const disabledCategoryIds = useMemo(
    () => sessionBudgets.map((budget) => budget.categoryId),
    [sessionBudgets],
  )

  const existingExpenseByCategory = useMemo(() => {
    const map = new Map<number, number>()
    existingBudgets?.forEach((b) => map.set(b.categoryId, b.expense ?? 0))
    return map
  }, [existingBudgets])

  const outstandingFor = (budget: PendingBudget) => {
    const expense = existingExpenseByCategory.get(budget.categoryId) ?? 0
    return Math.max(budget.amount - expense, 0)
  }

  const totalAllocated = useMemo(
    () => sessionBudgets.reduce((sum, budget) => sum + outstandingFor(budget), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionBudgets, existingExpenseByCategory],
  )

  const allocatedRaw = useMemo(
    () => sessionBudgets.reduce((sum, budget) => sum + budget.amount, 0),
    [sessionBudgets],
  )

  const unallocated = balance - totalAllocated
  const allocationPercentage = balance > 0 ? Math.round((allocatedRaw / balance) * 100) : 0
  const isOverAllocated = unallocated < 0

  const invalidBudgetIds = useMemo(
    () =>
      new Set(
        sessionBudgets.filter((budget) => budget.amount <= 0).map((budget) => budget.categoryId),
      ),
    [sessionBudgets],
  )

  const nextCustomCategoryDesign = useMemo(
    () => getAutoAssignedCategoryDesign(categories.filter((category) => !category.isGlobal)),
    [categories],
  )

  const isCreatingCustomSelection = selectedCategoryId === CUSTOM_CATEGORY_OPTION_VALUE

  // Hydrate sessionBudgets with existingBudgets if it's the first time visiting in this session
  useEffect(() => {
    if (existingBudgets && sessionBudgets.length === 0 && !hasHydratedRef.current) {
      dispatch(
        setPendingBudgets(
          existingBudgets.map((b) => ({
            categoryId: b.categoryId,
            categoryName: b.categoryName,
            categoryIcon: resolveCategoryDesign(b.categoryName).icon,
            categoryColor: resolveCategoryDesign(b.categoryName).color,
            amount: b.amount,
            period: b.period,
          })),
        ),
      )
      hasHydratedRef.current = true
    }
  }, [existingBudgets, dispatch, sessionBudgets.length])

  useEffect(() => {
    let mounted = true

    getCategories()
      .then((fetched) => {
        if (!mounted) return
        setCategories(fetched)
      })
      .catch(() => {
        if (!mounted) return
        setCategoryError('Unable to load categories.')
      })
      .finally(() => {
        if (!mounted) return
        setIsLoadingCategories(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const openModal = (budget?: PendingBudget) => {
    if (budget) {
      setSelectedBudgetId(budget.categoryId)
      setSelectedCategoryId(budget.categoryId)
      setAmountInput(budget.amount.toString())
      setSelectedPeriod(budget.period)
    } else {
      setSelectedBudgetId(null)
      setSelectedCategoryId('')
      setAmountInput('')
      setSelectedPeriod(SMART_BUDGET_PERIOD)
    }
    setCategoryValidationError(null)
    setAmountValidationError(null)
    setSubmissionError(null)
    setCustomCategoryName('')
    setCustomCategoryIcon(nextCustomCategoryDesign.icon)
    setCustomCategoryColor(nextCustomCategoryDesign.color)
    setCustomCategoryError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBudgetId(null)
    setCustomCategoryName('')
    setCustomCategoryIcon(nextCustomCategoryDesign.icon)
    setCustomCategoryColor(nextCustomCategoryDesign.color)
    setCustomCategoryError(null)
    setIsCreatingCustomCategory(false)
  }

  const handleAddBudgetClick = async () => {
    setCategoryValidationError(null)
    setAmountValidationError(null)
    setSubmissionError(null)
    setCustomCategoryError(null)

    if (!selectedCategoryId) {
      setCategoryValidationError('Please select a category.')
      return
    }

    const parsedAmount = Number(amountInput)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setAmountValidationError('Enter an amount of at least PHP 1.00.')
      return
    }

    const otherOutstanding = sessionBudgets
      .filter((b) => b.categoryId !== selectedBudgetId)
      .reduce((sum, b) => sum + outstandingFor(b), 0)
    const thisExpense =
      selectedBudgetId !== null ? (existingExpenseByCategory.get(selectedBudgetId) ?? 0) : 0
    const available = balance - otherOutstanding + thisExpense
    if (parsedAmount > available) {
      setAmountValidationError(
        `Amount cannot exceed your remaining balance of ${formatCurrency(Math.max(available, 0))}.`,
      )
      return
    }

    let matchedCategory = categories.find((c) => c.id === selectedCategoryId)
    if (selectedCategoryId === CUSTOM_CATEGORY_OPTION_VALUE) {
      const trimmedCustomCategoryName = customCategoryName.trim()
      if (!trimmedCustomCategoryName) {
        setCustomCategoryError('Custom category name is required.')
        return
      }

      const duplicateCategory = categories.some(
        (category) => category.name.toLowerCase() === trimmedCustomCategoryName.toLowerCase(),
      )
      if (duplicateCategory) {
        setCustomCategoryError('That category name already exists. Choose a different name.')
        return
      }

      setIsCreatingCustomCategory(true)
      try {
        matchedCategory = await createCategory({
          name: trimmedCustomCategoryName,
          icon: customCategoryIcon,
          color: customCategoryColor,
        })
        setCategories((currentCategories) => [...currentCategories, matchedCategory!])
      } catch (error) {
        console.error('Custom category creation failed:', error)
        setCustomCategoryError('Unable to create the custom category right now.')
        setIsCreatingCustomCategory(false)
        return
      }
      setIsCreatingCustomCategory(false)
    }

    if (!matchedCategory) {
      setSubmissionError('Selected category no longer exists.')
      return
    }

    const budgetData: PendingBudget = {
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      categoryIcon: matchedCategory.icon,
      categoryColor: matchedCategory.color,
      amount: Number(parsedAmount.toFixed(2)),
      period: selectedPeriod,
    }

    if (selectedBudgetId !== null) {
      dispatch(updatePendingBudget(budgetData))
    } else {
      dispatch(addPendingBudget(budgetData))
    }

    closeModal()
  }

  // No undo by design — see UNDO_POLICY.md. (Session-local removal; nothing is persisted yet.)
  const handleDeleteBudget = (categoryId: number) => {
    dispatch(removePendingBudget(categoryId))
  }

  const availableForCurrent = useMemo(() => {
    const otherOutstanding = sessionBudgets
      .filter((b) => b.categoryId !== selectedBudgetId)
      .reduce((sum, b) => sum + outstandingFor(b), 0)
    const thisExpense =
      selectedBudgetId !== null ? (existingExpenseByCategory.get(selectedBudgetId) ?? 0) : 0
    return Math.max(balance - otherOutstanding + thisExpense, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, sessionBudgets, selectedBudgetId, existingExpenseByCategory])

  if (!user || isLoadingBudgets) {
    return null
  }

  return (
    <>
      <section className={pageLayout.sectionGap}>
        <header className={pageLayout.headerGap}>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Manual Budget Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            Add budgets individually and keep session-local edits until you confirm.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-1 border border-ui-border-subtle p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              Allocated
            </p>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(allocatedRaw)}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {allocationPercentage}% of balance
            </p>
          </Card>
          <Card className="space-y-1 border border-ui-border-subtle p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              Unallocated
            </p>
            <p
              className={`text-2xl font-semibold ${
                unallocated < 0 ? 'text-ui-danger' : 'text-foreground'
              }`}
            >
              {formatCurrency(unallocated)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {unallocated < 0
                ? `Over-committed by ${formatCurrency(Math.abs(unallocated))}`
                : 'available'}
            </p>
          </Card>
        </div>

        <Card className="space-y-4 p-6">
          {categoryError ? (
            <p className="text-sm text-destructive" role="alert">
              {categoryError}
            </p>
          ) : null}

          <div className="space-y-0">
            {sessionBudgets.length === 0 ? (
              <p className="text-sm text-muted-foreground px-1 py-4">
                No budgets added yet. Tap + Add Budget to begin.
              </p>
            ) : (
              sessionBudgets.map((budget, index) => (
                <div key={`${budget.categoryId}-${index}`}>
                  {index > 0 && <hr className="border-ui-border-subtle" />}
                  <BudgetCard
                    budget={budget}
                    isInvalid={invalidBudgetIds.has(budget.categoryId)}
                    onEdit={() => openModal(budget)}
                    onRemove={() => handleDeleteBudget(budget.categoryId)}
                  />
                </div>
              ))
            )}
          </div>

          {submissionError && (
            <p className="text-sm text-destructive" role="alert">
              {submissionError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => openModal()}>
              + Add Budget
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={isCompleting || isSavingBatch}
              onClick={async () => {
                if (sessionBudgets.length === 0) {
                  // Instruction 6 / PRD Section 4, Story 12: zero-budget "Done" branch routes to the skip flow stub until the affordance location is resolved (PRD Open Question 5).
                  return
                }
                setSubmissionError(null)
                try {
                  if (user && !user.onboardingCompleted) {
                    if (!fundingSourceType) {
                      setSubmissionError('Choose a funding source before finishing onboarding.')
                      return
                    }
                    await complete({
                      startingFunds: balance,
                      fundingSourceType,
                      budgets: sessionBudgets.map((b) => ({
                        categoryId: b.categoryId,
                        amount: b.amount,
                        period: b.period,
                      })),
                    }).unwrap()
                  } else {
                    // Management flow: save budgets directly
                    await saveBatch({
                      budgets: sessionBudgets.map((b) => ({
                        categoryId: b.categoryId,
                        amount: b.amount,
                        period: b.period,
                      })),
                    }).unwrap()
                  }
                  navigate('/', { replace: true })
                } catch (err) {
                  console.error('Final onboarding completion failed:', err)
                  setSubmissionError(
                    getErrorMessage(
                      err,
                      'Unable to finish setup. Please check your allocations and try again.',
                    ),
                  )
                }
              }}
              disabled={sessionBudgets.length > 0 && isOverAllocated}
            >
              Done
            </Button>
          </div>

          {!user.onboardingCompleted && (
            <div className="flex justify-end text-sm">
              <SkipBudgetTrigger />
            </div>
          )}
        </Card>
      </section>

      <ResponsiveModal
        title={selectedBudgetId !== null ? 'Edit budget' : 'Add a budget'}
        open={isModalOpen}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleAddBudgetClick()}
              isLoading={isCreatingCustomCategory}
            >
              {selectedBudgetId !== null ? 'Update' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <ManualBudgetCategoryPicker
            categories={categories}
            value={selectedCategoryId}
            disabledIds={disabledCategoryIds.filter((id) => id !== selectedBudgetId)}
            loading={isLoadingCategories}
            onChange={(value) => {
              setSelectedCategoryId(value)
              setCategoryValidationError(null)
              setCustomCategoryError(null)
              setSubmissionError(null)
              if (value !== CUSTOM_CATEGORY_OPTION_VALUE) {
                setCustomCategoryName('')
                setCustomCategoryIcon(nextCustomCategoryDesign.icon)
                setCustomCategoryColor(nextCustomCategoryDesign.color)
              }
            }}
            error={categoryValidationError}
          />
          {isCreatingCustomSelection ? (
            <InlineCustomCategoryFields
              name={customCategoryName}
              icon={customCategoryIcon}
              color={customCategoryColor}
              nameError={customCategoryError ?? undefined}
              onNameChange={(value) => {
                setCustomCategoryName(value)
                setCustomCategoryError(null)
                setSubmissionError(null)
              }}
              onIconChange={(icon) => {
                setCustomCategoryIcon(icon)
                setCustomCategoryError(null)
                setSubmissionError(null)
              }}
              onColorChange={(color) => {
                setCustomCategoryColor(color)
                setCustomCategoryError(null)
                setSubmissionError(null)
              }}
            />
          ) : null}

          <Input
            label="Amount"
            type="number"
            min="1"
            max={availableForCurrent}
            step="0.01"
            endAdornment="PHP"
            helperText={`Enter up to ${formatCurrency(availableForCurrent)}.`}
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value)
              setAmountValidationError(null)
              setSubmissionError(null)
            }}
            error={amountValidationError ?? undefined}
          />

          {submissionError ? (
            <p className="text-sm text-destructive" role="alert">
              {submissionError}
            </p>
          ) : null}

          {/* Instruction 5 mount point: render the period selector component here once its location is confirmed. */}
          <BudgetPeriodSelector
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            referenceAmount={Number(amountInput) || 0}
          />
        </div>
      </ResponsiveModal>
    </>
  )
}
