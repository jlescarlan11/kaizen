import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HomePage } from '../features/home/HomePage'
import { render } from './test-utils'
import { DashboardTourAnchorsProvider } from '../features/home/DashboardTourAnchorsContext'

// Mocking RTK Query hooks directly
vi.mock('../app/store/api/budgetApi', () => ({
  useGetBudgetSummaryQuery: vi.fn(),
  useGetBudgetsQuery: vi.fn(),
}))

vi.mock('../app/store/api/transactionApi', () => ({
  useGetTransactionsQuery: vi.fn(),
  useUpdateTransactionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteTransactionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}))

vi.mock('../app/store/api/categoryApi', () => ({
  useGetCategoriesQuery: vi.fn(),
}))

import { useGetBudgetSummaryQuery, useGetBudgetsQuery } from '../app/store/api/budgetApi'
import { useGetTransactionsQuery } from '../app/store/api/transactionApi'
import { useGetCategoriesQuery } from '../app/store/api/categoryApi'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  balance: 5000,
}

describe('HomePage Refactor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the refactored layout with Total Balance', () => {
    vi.mocked(useGetBudgetSummaryQuery).mockReturnValue({
      data: {
        budgetCount: 0,
        balance: 5000,
        totalAllocated: 0,
        remainingToAllocate: 5000,
        allocationPercentage: 0,
      },
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetBudgetsQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetTransactionsQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetCategoriesQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)

    render(
      <DashboardTourAnchorsProvider>
        <HomePage />
      </DashboardTourAnchorsProvider>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockUser,
            isLoading: false,
          },
        } as unknown,
      },
    )

    // Total Balance should be prominent
    expect(screen.getByText(/total balance/i)).toBeInTheDocument()
    expect(screen.getByText(/5,000\.00/)).toBeInTheDocument()
  })

  it('should render Transactions, Budget, and Goal sections with "See all" links', () => {
    vi.mocked(useGetBudgetSummaryQuery).mockReturnValue({
      data: {
        budgetCount: 3,
        balance: 5000,
        totalAllocated: 300,
        remainingToAllocate: 4700,
        allocationPercentage: 6,
      },
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetBudgetsQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetTransactionsQuery).mockReturnValue({
      data: Array(10).fill({
        id: 1,
        amount: 100,
        description: 'Test',
        transactionDate: new Date().toISOString(),
        type: 'EXPENSE',
      }),
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)
    vi.mocked(useGetCategoriesQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as unknown)

    render(
      <DashboardTourAnchorsProvider>
        <HomePage />
      </DashboardTourAnchorsProvider>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockUser,
            isLoading: false,
          },
        } as unknown,
      },
    )

    // Sections should have headings and "See all" links
    expect(screen.getByRole('heading', { name: /transactions/i })).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /see all/i })

    expect(links.some((l) => l.getAttribute('href') === '/transactions')).toBe(true)
    expect(links.some((l) => l.getAttribute('href') === '/budget')).toBe(true)
    expect(links.some((l) => l.getAttribute('href') === '/goals')).toBe(true)

    expect(screen.getByRole('heading', { name: /budget/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /goal/i })).toBeInTheDocument()
  })

  it('should show skeleton loaders while fetching data', () => {
    vi.mocked(useGetBudgetSummaryQuery).mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
    } as unknown)
    vi.mocked(useGetBudgetsQuery).mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
    } as unknown)
    vi.mocked(useGetTransactionsQuery).mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
    } as unknown)
    vi.mocked(useGetCategoriesQuery).mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
    } as unknown)

    render(
      <DashboardTourAnchorsProvider>
        <HomePage />
      </DashboardTourAnchorsProvider>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockUser,
            isLoading: false,
          },
        } as unknown,
      },
    )

    // Skeletons should be visible
    const skeletonLists = screen.getAllByTestId('skeleton-list')
    expect(skeletonLists.length).toBeGreaterThan(0)
  })
})
