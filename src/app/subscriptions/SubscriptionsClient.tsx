'use client'

import { useState } from 'react'
import { Search, Copy, Check, Filter } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SubscriptionsClient({ initialSubscriptions }: { initialSubscriptions: any[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredSubscriptions = initialSubscriptions.filter(sub => {
    const matchesSearch = 
      sub.email?.toLowerCase().includes(search.toLowerCase()) || 
      sub.app_user_id?.toLowerCase().includes(search.toLowerCase()) ||
      sub.product_identifier?.toLowerCase().includes(search.toLowerCase())
      
    const matchesStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'pro' ? sub.is_pro : 
      !sub.is_pro

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-2 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search by email, ID, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 p-0 text-sm cursor-pointer outline-none w-full"
            >
              <option value="all">All Status</option>
              <option value="pro">Pro Only</option>
              <option value="free">Free Only</option>
            </select>
          </div>
          <div className="text-sm text-slate-500 whitespace-nowrap">
            Showing {filteredSubscriptions.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSubscriptions.map((sub) => (
                <tr key={`${sub.app_user_id}-${sub.created_at}`} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      {sub.email || 'Unknown'}
                      {sub.email && (
                        <button onClick={() => handleCopy(sub.email, `sub-email-${sub.app_user_id}`)} className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedId === `sub-email-${sub.app_user_id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    <div className="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                      {sub.app_user_id?.substring(0, 16)}...
                      {sub.app_user_id && (
                        <button onClick={() => handleCopy(sub.app_user_id, `sub-id-${sub.app_user_id}`)} className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedId === `sub-id-${sub.app_user_id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      sub.is_pro 
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                        : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                      {sub.is_pro ? 'PRO' : 'FREE'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="text-sm text-slate-900">{sub.product_identifier || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="text-sm text-slate-900 capitalize">{sub.period_type || '-'}</div>
                    <div className="text-xs text-slate-500">{sub.will_renew ? 'Auto-renews' : 'Cancels'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {sub.expires_date ? new Date(sub.expires_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No subscriptions found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
