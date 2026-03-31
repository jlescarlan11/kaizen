import { render, screen } from '../../../tests/test-utils'
import { describe, expect, it } from 'vitest'
import { DataList } from '../DataList'

describe('DataList', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]

  const renderItem = (item: { id: number; name: string }) => (
    <div data-testid={`item-${item.id}`}>{item.name}</div>
  )

  it('renders with data', () => {
    render(<DataList data={mockData} renderItem={renderItem} />)

    expect(screen.getByTestId('item-1')).toBeInTheDocument()
    expect(screen.getByTestId('item-2')).toBeInTheDocument()
    expect(screen.getByTestId('item-3')).toBeInTheDocument()
  })

  it('renders empty state when data is empty', () => {
    const emptyState = <div data-testid="empty-state">No data</div>
    render(<DataList data={[]} renderItem={renderItem} emptyState={emptyState} />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument()
  })

  it('returns null when data is empty and no emptyState is provided', () => {
    const { container } = render(<DataList data={[]} renderItem={renderItem} />)
    expect(container.firstChild).toBeNull()
  })

  it('places separators correctly (every item except the first)', () => {
    render(<DataList data={mockData} renderItem={renderItem} />)

    // Check that the first item DOES NOT have the separator class on its container
    // We navigate to the parent because the separator is on the wrapper div
    const firstItemWrapper = screen.getByTestId('item-1').parentElement
    expect(firstItemWrapper).not.toHaveClass('border-t')

    // Check that subsequent items DO have the separator class on their container
    const secondItemWrapper = screen.getByTestId('item-2').parentElement
    expect(secondItemWrapper).toHaveClass('border-t')
    expect(secondItemWrapper).toHaveClass('border-ui-border-subtle')

    const thirdItemWrapper = screen.getByTestId('item-3').parentElement
    expect(thirdItemWrapper).toHaveClass('border-t')
    expect(thirdItemWrapper).toHaveClass('border-ui-border-subtle')
  })

  it('applies custom className to the container', () => {
    const { container } = render(
      <DataList data={mockData} renderItem={renderItem} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
