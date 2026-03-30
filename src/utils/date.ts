import { subHours, subDays, startOfYesterday, endOfYesterday, startOfDay } from 'date-fns'

export function getDateRange(range: string): { start: string, end: string } {
  const now = new Date()
  let start = new Date()
  let end = now

  switch (range) {
    case '12h':
      start = subHours(now, 12)
      break
    case '24h':
      start = subHours(now, 24)
      break
    case 'yesterday':
      start = startOfYesterday()
      end = endOfYesterday()
      break
    case '7d':
      start = subDays(startOfDay(now), 7)
      break
    case '30d':
      start = subDays(startOfDay(now), 30)
      break
    case 'all':
      start = new Date('2020-01-01')
      break
    default:
      start = subDays(startOfDay(now), 7)
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}
