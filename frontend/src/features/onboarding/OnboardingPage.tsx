import type { ReactElement } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useCompleteOnboardingMutation } from '../../app/store/api/authApi'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Input } from '../../shared/components/Input'
import { CategoryList } from '../categories/CategoryList'
import { getCategories } from '../categories/api'
import type { Category } from '../categories/types'
import { validateBalance } from '../../shared/lib/validation'

export function OnboardingPage(): ReactElement {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const [completeOnboarding] = useCompleteOnboardingMutation()

  const [step, setStep] = useState(1)
  const [balance, setBalance] = useState('0.00')
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize validation error to avoid redundant re-renders.
  const balanceError = useMemo(() => validateBalance(balance), [balance])

  useEffect(() => {
    if (step === 2) {
      setIsCategoriesLoading(true)
      getCategories()
        .then(setCategories)
        .catch(() => setError('Failed to load default categories.'))
        .finally(() => setIsCategoriesLoading(false))
    }
  }, [step])

  const handleCompleteOnboarding = async () => {
    if (balanceError) return

    setIsSubmitting(true)
    setError(null)

    const numericBalance = parseFloat(balance)

    try {
      await completeOnboarding({
        openingBalance: numericBalance,
      }).unwrap()

      navigate('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 md:p-10 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome to Kaizen{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted-foreground">Let's get your account set up in just two steps.</p>
        </header>

        <div className="flex justify-center gap-2">
          <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Step 1: Set your opening balance</h2>
              <p className="text-sm text-muted-foreground">
                Enter the current amount in your main account. You can always change this later.
              </p>
            </div>

            <Input
              label="Opening Balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              error={balanceError ?? undefined}
              placeholder="0.00"
              startAdornment="₱"
              endAdornment="PHP"
              min="0"
              step="0.01"
              autoFocus
            />

            <Button
              className="w-full h-11"
              onClick={() => setStep(2)}
              disabled={Boolean(balanceError)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Step 2: Review your categories</h2>
              <p className="text-sm text-muted-foreground">
                We've pre-populated your account with these default categories to help you get
                started.
              </p>
            </div>

            <CategoryList categories={categories} isLoading={isCategoriesLoading} />

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 h-11"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                className="flex-[2] h-11"
                onClick={handleCompleteOnboarding}
                isLoading={isSubmitting}
              >
                Finish Setup
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  )
}
