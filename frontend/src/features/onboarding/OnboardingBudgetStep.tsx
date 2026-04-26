import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { BudgetCard } from '../budgets/components/BudgetCard'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import {
  useCompleteOnboardingMutation,
  useUpdateOnboardingProgressMutation,
} from '../../app/store/api/authApi'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { typography } from '../../shared/styles/typography'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { createCategory, getCategories } from '../categories/api'
import { InlineCustomCategoryFields } from '../categories/InlineCustomCategoryFields'
import { getAutoAssignedCategoryDesign, type CategoryIconName } from '../categories/designSystem'
import type { Category } from '../categories/types'
import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  ManualBudgetCategoryPicker,
} from '../budgets/ManualBudgetCategoryPicker'
import { AllocationTotalDisplay } from '../budgets/components/AllocationTotalDisplay'
import { BudgetPeriodSelector } from '../budgets/components/BudgetPeriodSelector'
import { SkipBudgetTrigger } from '../budgets/components/SkipBudgetTrigger'
import { SMART_BUDGET_PERIOD, SMART_BUDGET_SLOTS } from '../budgets/constants'
import { OnboardingErrorBlock } from './OnboardingErrorBlock'
import { clearStoredOnboardingDraft } from './onboardingDraftStorage'
import { toLocalISOString } from '../../shared/lib/dateUtils'
import {
  markCategoriesSeeded,
  selectBalanceValue,
  selectBudgetEditorDraft,
  selectCategoriesSeeded,
  selectFundingSourceType,
  selectPendingBudgets,
  selectInitialBalances,
  resetBudgetEditorDraft,
  setBudgetEditorDraft,
  setPendingBudgets,
  type PendingBudget,
} from './onboardingSlice'
import { type OnboardingStep } from './onboardingStep'
import { useOnboardingErrorHandler } from './useOnboardingErrorHandler'
import { cn } from '../../shared/lib/cn'
import { fluidLayout } from '../../shared/styles/layout'

function roundCurrency(value: number): number {
  return Number(value.toFixed(2))
}

function buildSuggestedBudgets(categories: Category[], balance: number): PendingBudget[] {
  const globalCategories = categories.filter((category) => category.isGlobal)
  const matchedIds = new Set<number>()
  const suggested: PendingBudget[] = []

  for (const slot of SMART_BUDGET_SLOTS) {
    const exactMatch = globalCategories.find(
      (category) => category.name.toLowerCase() === slot.categoryName.toLowerCase(),
    )
    const fallbackMatch = globalCategories.find((category) => !matchedIds.has(category.id))
    const selectedCategory = exactMatch ?? fallbackMatch

    if (!selectedCategory) {
      continue
    }

    matchedIds.add(selectedCategory.id)
    suggested.push({
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      amount: roundCurrency(balance * slot.percentage),
      period: SMART_BUDGET_PERIOD,
    })
  }

  return suggested
}

interface AllocationBarProps {
  allocated: number
  balance: number
  onOver: (isOver: boolean) => void
}

function AllocationBar({ allocated, balance, onOver }: AllocationBarProps): ReactElement {
  return (
    <AllocationTotalDisplay
      totalAllocated={allocated}
      available={balance}
      onStatusChange={(status) => onOver(status === 'over')}
    />
  )
}

export function OnboardingBudgetStep(): ReactElement | null {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuthState()
  const reduxBalance = useAppSelector(selectBalanceValue)
  const fundingSourceType = useAppSelector(selectFundingSourceType)
  const pendingBudgets = useAppSelector(selectPendingBudgets)
  const categoriesSeeded = useAppSelector(selectCategoriesSeeded)
  const budgetEditorDraft = useAppSelector(selectBudgetEditorDraft)
  const initialBalances = useAppSelector(selectInitialBalances)

  const balance = reduxBalance ?? user?.balance ?? 0

  const [updateProgress] = useUpdateOnboardingProgressMutation()
  const [complete, { isLoading: isCompleting }] = useCompleteOnboardingMutation()
  const {
    handleRequest,
    retry,
    error: onboardingError,
    isRetryDisabled,
  } = useOnboardingErrorHandler('BUDGET' as OnboardingStep)

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isOverAllocated, setIsOverAllocated] = useState(false)
  const [categorySelectionError, setCategorySelectionError] = useState<string | null>(null)
  const [amountValidationError, setAmountValidationError] = useState<string | null>(null)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const [customCategoryIcon, setCustomCategoryIcon] = useState<CategoryIconName>('home')
  const [customCategoryColor, setCustomCategoryColor] = useState('#1d4ed8')
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(null)
  const [isCreatingCustomCategory, setIsCreatingCustomCategory] = useState(false)

  const {
    isOpen: isCategoryModalOpen,
    editingCategoryId,
    selectedCategoryId,
    amountInput,
    selectedPeriod,
  } = budgetEditorDraft

  useEffect(() => {
    if (balance <= 0 || fundingSourceType == null) {
      navigate('/onboarding/balance', { replace: true })
    }
  }, [balance, fundingSourceType, navigate])

  useEffect(() => {
    if (balance <= 0 || fundingSourceType == null) {
      return
    }

    updateProgress({
      currentStep: 'BUDGET' as OnboardingStep,
      startingFunds: balance,
      fundingSourceType,
    }).catch((error) => console.error('Failed to persist onboarding budget step:', error))
  }, [balance, fundingSourceType, updateProgress])

  useEffect(() => {
    let mounted = true

    getCategories()
      .then((fetchedCategories) => {
        if (!mounted) {
          return
        }

        setCategories(fetchedCategories)
        setCategoryError(null)

        if (!categoriesSeeded && pendingBudgets.length === 0) {
          const suggestedBudgets = buildSuggestedBudgets(fetchedCategories, balance)

          if (suggestedBudgets.length === 0) {
            setCategoryError('Unable to prepare budget suggestions. You can add them manually.')
            return
          }

          dispatch(setPendingBudgets(suggestedBudgets))
          dispatch(markCategoriesSeeded())
        }
      })
      .catch(() => {
        if (!mounted) {
          return
        }

        setCategoryError('Unable to load categories right now.')
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingCategories(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [balance, categoriesSeeded, dispatch, pendingBudgets.length])

  const totalAllocated = useMemo(() => {
    return pendingBudgets.reduce((sum, budget) => sum + budget.amount, 0)
  }, [pendingBudgets])

  const invalidBudgetIds = useMemo(() => {
    return new Set(
      pendingBudgets.filter((budget) => budget.amount <= 0).map((budget) => budget.categoryId),
    )
  }, [pendingBudgets])

  const disabledCategoryIds = useMemo(() => {
    if (editingCategoryId == null) {
      return pendingBudgets.map((budget) => budget.categoryId)
    }

    return pendingBudgets
      .filter((budget) => budget.categoryId !== editingCategoryId)
      .map((budget) => budget.categoryId)
  }, [editingCategoryId, pendingBudgets])

  const availableForCurrent = useMemo(() => {
    const otherTotal = pendingBudgets
      .filter((budget) => budget.categoryId !== editingCategoryId)
      .reduce((sum, budget) => sum + budget.amount, 0)

    return Math.max(balance - otherTotal, 0)
  }, [balance, editingCategoryId, pendingBudgets])

  const nextCustomCategoryDesign = useMemo(
    () => getAutoAssignedCategoryDesign(categories.filter((category) => !category.isGlobal)),
    [categories],
  )

  const isCreatingCustomSelection = selectedCategoryId === CUSTOM_CATEGORY_OPTION_VALUE

  const openAddModal = (): void => {
    dispatch(
      setBudgetEditorDraft({
        isOpen: true,
        editingCategoryId: null,
        selectedCategoryId: null,
        amountInput: '',
        selectedPeriod: SMART_BUDGET_PERIOD,
      }),
    )
    setCategorySelectionError(null)
    setAmountValidationError(null)
    setCustomCategoryName('')
    setCustomCategoryIcon(nextCustomCategoryDesign.icon)
    setCustomCategoryColor(nextCustomCategoryDesign.color)
    setCustomCategoryError(null)
  }

  const openEditModal = (categoryId: number): void => {
    const budget = pendingBudgets.find((candidate) => candidate.categoryId === categoryId)
    if (!budget) {
      return
    }

    dispatch(
      setBudgetEditorDraft({
        isOpen: true,
        editingCategoryId: categoryId,
        selectedCategoryId: categoryId,
        amountInput: budget.amount.toString(),
        selectedPeriod: budget.period,
      }),
    )
    setCategorySelectionError(null)
    setAmountValidationError(null)
    setCustomCategoryName('')
    setCustomCategoryIcon(nextCustomCategoryDesign.icon)
    setCustomCategoryColor(nextCustomCategoryDesign.color)
    setCustomCategoryError(null)
  }

  const closeModal = (): void => {
    dispatch(resetBudgetEditorDraft())
    setCategorySelectionError(null)
    setAmountValidationError(null)
    setCustomCategoryName('')
    setCustomCategoryIcon(nextCustomCategoryDesign.icon)
    setCustomCategoryColor(nextCustomCategoryDesign.color)
    setCustomCategoryError(null)
    setIsCreatingCustomCategory(false)
  }

  const handleRemoveBudget = (categoryId: number): void => {
    dispatch(setPendingBudgets(pendingBudgets.filter((budget) => budget.categoryId !== categoryId)))
    setSubmissionError(null)
  }

  const handleConfirmCategory = async (): Promise<void> => {
    setCategorySelectionError(null)
    setAmountValidationError(null)
    setCustomCategoryError(null)

    if (selectedCategoryId == null) {
      setCategorySelectionError('Please select a category.')
      return
    }

    const parsedAmount = Number(amountInput)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setAmountValidationError('Enter an amount of at least PHP 1.00.')
      return
    }

    let selectedCategory = categories.find((category) => category.id === selectedCategoryId)
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
        selectedCategory = await createCategory({
          name: trimmedCustomCategoryName,
          icon: customCategoryIcon,
          color: customCategoryColor,
        })
        setCategories((currentCategories) => [...currentCategories, selectedCategory!])
      } catch (error) {
        console.error('Custom category creation failed:', error)
        setCustomCategoryError('Unable to create the custom category right now.')
        setIsCreatingCustomCategory(false)
        return
      }
      setIsCreatingCustomCategory(false)
    }

    if (!selectedCategory) {
      setCategorySelectionError('Selected category is no longer available.')
      return
    }

    const otherTotal = pendingBudgets
      .filter((budget) => budget.categoryId !== editingCategoryId)
      .reduce((sum, budget) => sum + budget.amount, 0)
    const available = balance - otherTotal

    if (parsedAmount > available) {
      setAmountValidationError(
        `Amount cannot exceed your remaining balance of ${formatCurrency(Math.max(available, 0))}.`,
      )
      return
    }

    const budgetData: PendingBudget = {
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      amount: roundCurrency(parsedAmount),
      period: selectedPeriod,
    }

    if (editingCategoryId == null) {
      dispatch(setPendingBudgets([...pendingBudgets, budgetData]))
    } else {
      dispatch(
        setPendingBudgets(
          pendingBudgets.map((budget) =>
            budget.categoryId === editingCategoryId ? budgetData : budget,
          ),
        ),
      )
    }

    setSubmissionError(null)
    closeModal()
  }

  const canFinish =
    pendingBudgets.length > 0 &&
    invalidBudgetIds.size === 0 &&
    !isOverAllocated &&
    !isLoadingCategories

  const handleFinishSetup = async (): Promise<void> => {
    if (!canFinish) {
      setSubmissionError('Add at least one valid budget before finishing setup.')
      return
    }

    if (fundingSourceType == null) {
      setSubmissionError('Choose a funding source before finishing setup.')
      navigate('/onboarding/balance', { replace: true })
      return
    }

    setSubmissionError(null)

    try {
      await handleRequest(() =>
        complete({
          startingFunds: balance,
          fundingSourceType,
          budgets: pendingBudgets.map((budget) => ({
            categoryId: budget.categoryId,
            amount: budget.amount,
            period: budget.period,
          })),
          initialBalances: initialBalances.map((b) => ({
            paymentMethodId: b.paymentMethodId,
            amount: b.amount,
            description: 'Opening Balance',
            notes: 'Initial setup',
            transactionDate: toLocalISOString(new Date()),
          })),
        }).unwrap(),
      )

      if (user) {
        clearStoredOnboardingDraft(user.id)
      }

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Onboarding budget completion failed:', error)
      const backendMessage = (error as { data?: { message?: string }; message?: string })?.data
        ?.message
      setSubmissionError(backendMessage || 'Unable to finish setup right now. Please try again.')
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className={cn('flex flex-col', fluidLayout.sectionGap)}>
        <section aria-label="Balance overview" className="space-y-4">
          <p className="text-sm font-medium leading-none text-foreground">Balance overview</p>

          <div className="">
            <AllocationBar
              allocated={totalAllocated}
              balance={balance}
              onOver={setIsOverAllocated}
            />
          </div>
        </section>

        <section aria-label="Your budgets" className="">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium leading-none text-foreground">
              Your budgets
              {pendingBudgets.length > 0 && (
                <span className="ml-2 rounded-full bg-ui-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                  {pendingBudgets.length}
                </span>
              )}
            </h2>
            <Button
              variant="secondary"
              className={cn(fluidLayout.touchTarget, 'rounded-xl px-5 text-sm font-semibold')}
              onClick={openAddModal}
              disabled={isLoadingCategories}
            >
              + Add budget
            </Button>
          </div>

          {categoryError ? (
            <p
              className="rounded-xl bg-ui-warning-subtle px-4 py-3 text-sm font-medium leading-relaxed text-muted-foreground"
              role="alert"
            >
              {categoryError}
            </p>
          ) : null}

          {isLoadingCategories ? (
            <div className="px-4 py-3.5">
              {[0, 1, 2].map((index) => (
                <div key={index} className="">
                  {index > 0 && <hr className="border-ui-border-subtle" />}
                  <div className="h-20 flex items-center gap-4 py-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-ui-surface-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-ui-surface-muted rounded" />
                      <div className="h-3 w-32 bg-ui-surface-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingBudgets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span
                className="text-3xl font-bold tracking-tight text-muted-foreground/30"
                aria-hidden="true"
              >
                PHP
              </span>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">No budgets yet</p>
                <p className="text-sm text-subtle-foreground">
                  Add at least one to finish setup, or skip for now.
                </p>
              </div>
            </div>
          ) : (
            <div className="">
              {pendingBudgets.map((budget, index) => (
                <div key={budget.categoryId} className="">
                  {index > 0 && <hr className="border-ui-border-subtle" />}
                  <BudgetCard
                    budget={budget}
                    isInvalid={invalidBudgetIds.has(budget.categoryId)}
                    onEdit={() => openEditModal(budget.categoryId)}
                    onRemove={() => handleRemoveBudget(budget.categoryId)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {submissionError ? (
          <p className={typography['body-sm']} role="alert">
            {submissionError}
          </p>
        ) : null}
      </div>

      <hr className="my-10 border-ui-border" />

      {/* Summary and Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ui-border-subtle bg-background/95 px-5 py-4 backdrop-blur-sm sm:relative sm:inset-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between sm:rounded-2xl sm:bg-ui-card sm:p-0">
          <div className="flex flex-col gap-0.5 sm:gap-1 sm:p-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm sm:text-foreground">
              Total Starting Funds
            </p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(totalAllocated)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SkipBudgetTrigger className="hidden sm:inline-block" />
            <Button
              variant="primary"
              onClick={handleFinishSetup}
              className={cn(
                fluidLayout.touchTarget,
                'rounded-full p-0 sm:rounded-xl sm:px-8',
                'h-12 w-12 sm:h-auto sm:w-auto',
              )}
              isLoading={isCompleting}
              disabled={!canFinish}
              aria-label="Finish setup"
            >
              <span className="hidden sm:inline">Finish setup</span>
              <Check className="h-6 w-6 sm:hidden" />
            </Button>
          </div>
        </div>

        {onboardingError ? (
          <div className="mt-4">
            <OnboardingErrorBlock
              error={onboardingError}
              onRetry={retry}
              isRetryDisabled={isRetryDisabled}
            />
          </div>
        ) : null}

        <div className="mt-4 sm:hidden">
          <SkipBudgetTrigger className="w-full text-center" />
        </div>
      </div>

      <ResponsiveModal
        title={editingCategoryId == null ? 'Add a budget' : 'Edit budget'}
        open={isCategoryModalOpen}
        onClose={closeModal}
        footer={
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-2">
            <Button
              variant="ghost"
              className={cn(fluidLayout.touchTarget, 'w-full sm:h-10 sm:w-auto sm:px-5')}
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className={cn(fluidLayout.touchTarget, 'w-full sm:h-10 sm:w-auto sm:px-5')}
              onClick={() => void handleConfirmCategory()}
              isLoading={isCreatingCustomCategory}
            >
              {editingCategoryId == null ? 'Add budget' : 'Save changes'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <ManualBudgetCategoryPicker
            categories={categories}
            value={selectedCategoryId ?? ''}
            disabledIds={disabledCategoryIds}
            loading={isLoadingCategories}
            className={fluidLayout.touchTarget}
            onChange={(value) => {
              dispatch(
                setBudgetEditorDraft({
                  selectedCategoryId: value === '' ? null : value,
                }),
              )
              setCategorySelectionError(null)
              setCustomCategoryError(null)
              setSubmissionError(null)
              if (value !== CUSTOM_CATEGORY_OPTION_VALUE) {
                setCustomCategoryName('')
                setCustomCategoryIcon(nextCustomCategoryDesign.icon)
                setCustomCategoryColor(nextCustomCategoryDesign.color)
              }
            }}
            error={categorySelectionError}
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
            inputMode="decimal"
            min="1"
            step="0.01"
            startAdornment={
              <span className="text-sm font-semibold text-muted-foreground">PHP</span>
            }
            value={amountInput}
            className={cn(fluidLayout.touchTarget, 'font-semibold text-right')}
            onChange={(event) => {
              dispatch(
                setBudgetEditorDraft({
                  amountInput: event.target.value,
                }),
              )
              setAmountValidationError(null)
              setSubmissionError(null)
            }}
            error={amountValidationError ?? undefined}
            helperText={
              !amountValidationError
                ? `Unallocated: ${formatCurrency(availableForCurrent)}`
                : undefined
            }
          />
          <BudgetPeriodSelector
            value={selectedPeriod}
            onChange={(period) => dispatch(setBudgetEditorDraft({ selectedPeriod: period }))}
            referenceAmount={Number(amountInput) || 0}
          />
        </div>
      </ResponsiveModal>
    </>
  )
}
