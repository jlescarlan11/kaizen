import { useState, useMemo, type ReactElement } from 'react'
import { Modal } from '../../../shared/components/Modal'
import { Button } from '../../../shared/components/Button'
import { assembleExportData } from '../export/exportAssembly'
import { serializeToCSV } from '../export/exportSerializer'
import { deliverExportFile } from '../export/exportDelivery'
import { constructFilterMetadata, generateFilenameSuffix } from '../export/exportMetadata'
import { useGetCategoriesQuery } from '../../../app/store/api/categoryApi'
import { useGetPaymentMethodsQuery } from '../../../app/store/api/paymentMethodApi'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import type { FilterState, SortState } from '../types'
import { TransactionFilter } from './TransactionFilter'
import { TransactionSearch } from './TransactionSearch'
import { cn } from '../../../shared/lib/cn'
import { SharedIcon } from '../../../shared/components/IconRegistry'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: TransactionResponse[]
  initialFilter?: FilterState
  initialSearch?: string
  initialSort?: SortState
}

/**
 * Instruction 4, 5, 6, 7: Export Modal
 *
 * Handles both Full and Filtered export flows.
 * Includes a pre-export filter interface (Instruction 5) and
 * a transaction count preview (Instruction 6).
 */
export function ExportModal({
  isOpen,
  onClose,
  transactions,
  initialFilter = { categories: [], types: [], paymentMethods: [] },
  initialSearch = '',
  initialSort = { criterion: 'date', direction: 'desc' },
}: ExportModalProps): ReactElement {
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: paymentMethods = [] } = useGetPaymentMethodsQuery()

  const [exportType, setExportType] = useState<'FULL' | 'FILTERED'>('FULL')
  const [filterState, setFilterState] = useState<FilterState>(initialFilter)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  // Instruction 6: Pre-Export Transaction Count Preview
  // We use the assembly function to get the actual rows that will be exported.
  const exportRows = useMemo(() => {
    return assembleExportData({
      transactions,
      filterState: exportType === 'FILTERED' ? filterState : undefined,
      searchQuery: exportType === 'FILTERED' ? searchQuery : '',
      sortState: initialSort,
    })
  }, [transactions, exportType, filterState, searchQuery, initialSort])

  const handleExport = () => {
    // 1. Serialization (Instruction 2)
    let csvContent = serializeToCSV(exportRows)

    // 2. Metadata Recording (Instruction 8)
    // Recorded in file if filtered (Open Question 7: implementing both)
    if (exportType === 'FILTERED') {
      const metadata = constructFilterMetadata(filterState, searchQuery, categories, paymentMethods)
      csvContent = `Export Filter: ${metadata}\n\n${csvContent}`
    }

    // 3. Filename Construction (Instruction 3)
    const dateStr = new Date().toISOString().split('T')[0]
    const suffix = exportType === 'FILTERED' ? generateFilenameSuffix(filterState, searchQuery) : ''
    const filename = `transactions_${dateStr}${suffix}.csv`

    // 4. File Delivery (Instruction 3)
    deliverExportFile(csvContent, filename)
    onClose()
  }

  const handleClearFilters = () => {
    setFilterState({ categories: [], types: [], paymentMethods: [] })
    setSearchQuery('')
  }

  return (
    <Modal open={isOpen} title="Export Transactions" onClose={onClose}>
      <div className="space-y-6">
        {/* Export Type Toggle (Instruction 4 vs Instruction 7) */}
        <div className="flex p-1 bg-ui-surface-muted rounded-xl border border-ui-border-subtle">
          <button
            onClick={() => setExportType('FULL')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              exportType === 'FULL'
                ? 'bg-ui-surface text-primary shadow-sm ring-1 ring-ui-border-subtle'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Full Export
          </button>
          <button
            onClick={() => setExportType('FILTERED')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              exportType === 'FILTERED'
                ? 'bg-ui-surface text-primary shadow-sm ring-1 ring-ui-border-subtle'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Filtered Export
          </button>
        </div>

        {/* Pre-Export Filter Interface (Instruction 5) */}
        {exportType === 'FILTERED' && (
          <div className="space-y-4 p-4 rounded-xl border border-ui-border-subtle bg-ui-surface-muted/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Export Scope
              </p>
              {(filterState.categories.length > 0 ||
                filterState.types.length > 0 ||
                filterState.paymentMethods.length > 0 ||
                searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-primary hover:text-primary-hover uppercase tracking-wide flex items-center gap-1"
                >
                  <SharedIcon type="ui" name="close" size={10} />
                  Clear
                </button>
              )}
            </div>
            <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
            <TransactionFilter
              filter={filterState}
              onChange={setFilterState}
              onClear={() => setFilterState({ categories: [], types: [], paymentMethods: [] })}
            />
          </div>
        )}

        {/* Count Preview (Instruction 6) */}
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-ui-border rounded-2xl bg-ui-surface shadow-inner">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Ready to Export
          </p>
          <p className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
            {exportRows.length}
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Transactions matched</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1 h-12 rounded-xl font-semibold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl font-semibold gap-2"
            onClick={handleExport}
            disabled={exportRows.length === 0 && exportType === 'FILTERED'}
          >
            <SharedIcon type="ui" name="download" size={16} />
            Download CSV
          </Button>
        </div>

        {exportRows.length === 0 && exportType === 'FILTERED' && (
          <p className="text-center text-xs text-ui-danger font-medium animate-pulse">
            No transactions match your current filters.
          </p>
        )}
      </div>
    </Modal>
  )
}
