import { describe, expect, it } from 'vitest'
import { formatCurrency } from '../shared/lib/formatCurrency'

describe('Currency Formatting', () => {
  it('should use the "PHP " prefix instead of the Peso sign', () => {
    // We'll update the implementation to match this expectation
    const formatted = formatCurrency(1000)
    expect(formatted).toContain('PHP')
    expect(formatted).not.toContain('₱')
  })
})
