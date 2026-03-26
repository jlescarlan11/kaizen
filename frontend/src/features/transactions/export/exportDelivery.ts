/**
 * Instruction 3: Export File Delivery
 *
 * Implements the platform-appropriate file delivery mechanism (direct download).
 * Hands the serialized file (as string content) to the user's browser.
 *
 * NOTE: PRD Open Question 2 (delivery mechanism) is unconfirmed; implementing
 * browser download as the default for the web platform.
 * NOTE: Filename includes format extension and generation date per Instruction 3.
 *
 * @param content Serialized file content (CSV string).
 * @param filename Target name of the file (e.g., 'transactions_2026-03-26.csv').
 */
export function deliverExportFile(content: string, filename: string): void {
  // 1. Create Blob and Object URL
  // We use UTF-8 BOM to ensure compatibility with certain spreadsheet tools
  // (like Excel) when they open CSV files.
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  // 2. Create Temporary Download Link
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // 3. Execution (Simulate Click)
  // Appending to body ensures the click is handled in all browser environments.
  document.body.appendChild(link)
  link.click()

  // 4. Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
