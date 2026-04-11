/**
 * Formats a date as an ISO 8601 string with local timezone offset.
 * Example: 2026-04-11T23:45:00+08:00
 */
export const toLocalISOString = (dateInput: Date | string): string => {
  let date: Date
  if (typeof dateInput === 'string') {
    if (dateInput.includes('T')) {
      date = new Date(dateInput)
    } else {
      const [year, month, day] = dateInput.split('-').map(Number)
      date = new Date(year, month - 1, day)
    }
  } else {
    date = dateInput
  }

  const tzo = -date.getTimezoneOffset()
  const dif = tzo >= 0 ? '+' : '-'
  const pad = (num: number) => (num < 10 ? '0' : '') + num

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' +
    pad(Math.abs(tzo) % 60)
  )
}
