import { type ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { CategoryList } from '../categories/CategoryList'
import { getCategories } from '../categories/api'
import type { Category } from '../categories/types'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import {
  useCompleteOnboardingMutation,
  useUpdateOnboardingProgressMutation,
} from '../../app/store/api/authApi'
import {
  markCategoriesSeeded,
  selectBalanceValue,
  selectBudgetChoice,
  selectCategoriesSeeded,
  setBudgetChoice,
} from './onboardingSlice'
import { type OnboardingStep } from './onboardingStep'

let cachedCategories: Category[] | null = null

export function BudgetPromptStep(): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const balanceValue = useAppSelector(selectBalanceValue)
  const budgetChoice = useAppSelector(selectBudgetChoice)
  const categoriesSeeded = useAppSelector(selectCategoriesSeeded)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [updateProgress] = useUpdateOnboardingProgressMutation()
  const [complete] = useCompleteOnboardingMutation()

  useEffect(() => {
    if (cachedCategories) {
      setCategories(cachedCategories)
    }
    if (categoriesSeeded) {
      return
    }
    setLoadingCategories(true)
    getCategories()
      .then((results) => {
        cachedCategories = results
        setCategories(results)
        dispatch(markCategoriesSeeded())
      })
      .catch(() => {
        setError('Failed to load default categories.')
      })
      .finally(() => {
        setLoadingCategories(false)
      })
  }, [categoriesSeeded, dispatch])

  const handleComplete = async (): Promise<void> => {
    if (balanceValue == null) {
      setError('Please provide your opening balance before finishing onboarding.')
      return
    }

    const choice = budgetChoice ?? 'default'
    dispatch(setBudgetChoice(choice))
    setError(null)
    setIsSubmitting(true)

    try {
      await updateProgress({
        currentStep: 'BUDGET' as OnboardingStep,
        balanceValue,
        budgetChoice: choice,
      }).unwrap()
      await complete({ openingBalance: balanceValue }).unwrap()
      navigate('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-ui-surface p-6 md:p-10">
      <div>
        <p className="text-sm font-semibold text-foreground">Step 2: Review your categories</p>
        <p className="text-sm text-muted-foreground">
          We have seeded the default categories to help you get going.
        </p>
      </div>

      <CategoryList categories={categories} isLoading={loadingCategories} />

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button className="w-full" onClick={handleComplete} isLoading={isSubmitting}>
        Finish Setup
      </Button>
    </div>
  )
}
