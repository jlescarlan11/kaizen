import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Input } from '../../shared/components/Input'
import { Modal } from '../../shared/components/Modal'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { getCategories } from '../categories/api'
import type { Category } from '../categories/types'
import { ManualBudgetCategoryPicker } from './ManualBudgetCategoryPicker'
import { SMART_BUDGET_PERIOD } from './constants'
import type { BudgetPeriod } from './constants'
import { AllocationTotalDisplay } from './components/AllocationTotalDisplay'
import { BudgetPeriodSelector } from './components/BudgetPeriodSelector'
import { SkipBudgetTrigger } from './components/SkipBudgetTrigger'
import { useCreateBudgetMutation } from '../../app/store/api/budgetApi'
import type { BudgetCreatePayload } from '../../app/store/api/budgetApi'

interface SessionBudget {
  id: string
  categoryId: number
  categoryName: string
  amount: number
}

export function ManualBudgetSetupPage(): ReactElement | null {
  const { user } = useAuthState()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('')
  const [amountInput, setAmountInput] = useState('')
  const [categoryValidationError, setCategoryValidationError] = useState<string | null>(null)
  const [amountValidationError, setAmountValidationError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [sessionBudgets, setSessionBudgets] = useState<SessionBudget[]>([])
  const [isOverAllocated, setIsOverAllocated] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(SMART_BUDGET_PERIOD)

  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation()

  const disabledCategoryIds = useMemo(
    () => sessionBudgets.map((budget) => budget.categoryId),
    [sessionBudgets],
  )

  const totalAllocated = useMemo(
    () => sessionBudgets.reduce((sum, budget) => sum + budget.amount, 0),
    [sessionBudgets],
  )

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
      }),
    [],
  )

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

  const openModal = () => {
    setSelectedCategoryId('')
    setAmountInput('')
    setCategoryValidationError(null)
    setAmountValidationError(null)
    setSubmissionError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleAddBudgetClick = async () => {
    setCategoryValidationError(null)
    setAmountValidationError(null)
    setSubmissionError(null)

    if (!selectedCategoryId) {
      setCategoryValidationError('Please select a category.')
      return
    }

    const parsedAmount = Number(amountInput)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountValidationError('Enter an amount greater than zero.')
      return
    }

    const payload: BudgetCreatePayload = {
      categoryId: selectedCategoryId,
      amount: Number(parsedAmount.toFixed(2)),
      period: selectedPeriod,
    }

    try {
      const created = await createBudget(payload).unwrap()
      setSessionBudgets((prev) => [
        ...prev,
        {
          id: `${created.id}-${Date.now()}`,
          categoryId: created.categoryId,
          categoryName: created.categoryName,
          amount: created.amount,
        },
      ])
      setSelectedCategoryId('')
      setAmountInput('')
      closeModal()
    } catch (error) {
      console.error('Manual budget save failed:', error)
      setSubmissionError('Unable to save budget. Please try again.')
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Manual Budget Setup
        </h1>
        <p className="text-sm text-muted-foreground">
          Add budgets individually and keep session-local edits until you confirm.
        </p>
      </header>

      <div className="rounded-2xl border border-ui-border-subtle bg-ui-surface-subtle/60 p-4">
        {/* Instruction 4 integration slot: render the allocation total display here. */}
        <AllocationTotalDisplay
          totalAllocated={totalAllocated}
          balance={user?.openingBalance ?? 0}
          onStatusChange={(status) => setIsOverAllocated(status === 'over')}
        />
      </div>

      <Card className="space-y-4 p-6">
        {categoryError ? (
          <p className="text-sm text-destructive" role="alert">
            {categoryError}
          </p>
        ) : null}

        <div className="space-y-3">
          {sessionBudgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No budgets added yet. Tap + Add Budget to begin.
            </p>
          ) : (
            sessionBudgets.map((budget) => (
              <Card
                key={budget.id}
                className="flex items-center justify-between gap-2 border border-ui-border-subtle p-4"
                tone="neutral"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{budget.categoryName}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-tight">
                    Pending confirmation
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {currencyFormatter.format(budget.amount)}
                </p>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={openModal}>
            + Add Budget
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (sessionBudgets.length === 0) {
                // Instruction 6 / PRD Section 4, Story 12: zero-budget "Done" branch routes to the skip flow stub until the affordance location is resolved (PRD Open Question 5).
                return
              }
              navigate('/', { replace: true })
            }}
            // PRD Open Question 2 currently defines over-allocation as a hard block; switch to a soft warning + confirmation flow here if that changes.
            disabled={sessionBudgets.length > 0 && isOverAllocated}
          >
            Done
          </Button>
        </div>

        {/* Instruction 6 placement stub (PRD Open Question 5) — confirm whether Skip belongs on this screen before final placement. */}
        <div className="flex justify-end text-sm">
          <SkipBudgetTrigger />
        </div>
      </Card>

      <Modal
        title="Add a budget"
        open={isModalOpen}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="button" isLoading={isCreating} onClick={handleAddBudgetClick}>
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <ManualBudgetCategoryPicker
            categories={categories}
            value={selectedCategoryId}
            disabledIds={disabledCategoryIds}
            loading={isLoadingCategories}
            onChange={(value) => {
              setSelectedCategoryId(value)
              setCategoryValidationError(null)
              setSubmissionError(null)
            }}
            error={categoryValidationError}
          />

          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            endAdornment="PHP"
            helperText="Enter the amount you want to budget for this category."
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
      </Modal>
    </section>
  )
}
