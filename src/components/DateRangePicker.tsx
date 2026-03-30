'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Suspense } from 'react'

const ranges = [
  { label: 'Last 12h', value: '12h' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
]

function PickerInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get('range') || '7d'

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams)
    params.set('range', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors">
      <div className="pl-3 text-slate-400">
        <Calendar className="h-4 w-4" />
      </div>
      <select
        value={currentRange}
        onChange={handleRangeChange}
        className="appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
      >
        {ranges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export function DateRangePicker() {
  return (
    <Suspense fallback={<div className="h-9 w-32 bg-slate-100 animate-pulse rounded-lg"></div>}>
      <PickerInner />
    </Suspense>
  )
}
