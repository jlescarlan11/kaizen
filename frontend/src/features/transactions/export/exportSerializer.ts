import type { ExportRow } from './exportAssembly'

/**
 * Instruction 2: Export Format Serializer
 *
 * Converts the assembled row collection into the confirmed file format (CSV).
 * Produces a file with labeled column headers and correctly formatted values.
 *
 * NOTE: PRD Open Question 1 (format) is unconfirmed; implementing CSV (no library).
 * NOTE: RFC 4180 compliant escaping for commas, quotes, and newlines.
 *
 * @param rows Array of human-readable ExportRow objects.
 * @returns A CSV-formatted string.
 */
export function serializeToCSV(rows: ExportRow[]): string {
  // 1. Header Definition
  // PRD Instruction 2: First row is a header row with human-readable column names.
  const HEADERS: (keyof ExportRow)[] = [
    'Date',
    'Type',
    'Amount',
    'Description',
    'Category',
    'Payment Method',
  ]

  // 2. CSV Escaping (RFC 4180)
  // If a value contains a comma, double quote, or newline, it MUST be wrapped in
  // double quotes, and any internal double quotes MUST be escaped by doubling them.
  const escapeCSV = (value: string | number): string => {
    const stringValue = String(value)
    const needsQuotes = /[",\n\r]/.test(stringValue)
    if (needsQuotes) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // 3. Row Serialization
  const headerLine = HEADERS.join(',')
  const dataLines = rows.map((row) => {
    return HEADERS.map((header) => escapeCSV(row[header])).join(',')
  })

  // 4. Final Dataset Assembly
  // NOTE: If rows array is empty, this returns only the header line (PRD Instruction 2).
  return [headerLine, ...dataLines].join('\n')
}
