import { describe, it, expect } from 'vitest'
import { validateTransaction, ErrorCode } from './validationRules'

describe('validateTransaction', () => {
  it('requires category for EXPENSE', () => {
    const result = validateTransaction({
      amount: 100,
      type: 'EXPENSE',
      paymentMethodId: 1,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({ field: 'categoryId', code: ErrorCode.REQUIRED })
  })

  it('does NOT require category for INCOME', () => {
    const result = validateTransaction({
      amount: 100,
      type: 'INCOME',
      paymentMethodId: 1,
    })
    expect(result.valid).toBe(true)
  })

  it('requires payment method for both EXPENSE and INCOME', () => {
    const expenseResult = validateTransaction({
      amount: 100,
      type: 'EXPENSE',
      categoryId: 1,
    })
    expect(expenseResult.valid).toBe(false)
    expect(expenseResult.errors).toContainEqual({
      field: 'paymentMethodId',
      code: ErrorCode.REQUIRED,
    })

    const incomeResult = validateTransaction({
      amount: 100,
      type: 'INCOME',
    })
    expect(incomeResult.valid).toBe(false)
    expect(incomeResult.errors).toContainEqual({
      field: 'paymentMethodId',
      code: ErrorCode.REQUIRED,
    })
  })

  it('validates amount is positive', () => {
    const result = validateTransaction({
      amount: 0,
      type: 'INCOME',
      paymentMethodId: 1,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({ field: 'amount', code: ErrorCode.AMOUNT_POSITIVE })
  })
})
