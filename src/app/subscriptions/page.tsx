import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

export default async function SubscriptionsPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let subscriptions: any[] = []
  let error = null

  if (isDemo) {
    const baseTime = 1711843200000
    subscriptions = Array.from({ length: 15 }).map((_, i) => ({
      app_user_id: `user_demo_${i}`,
      email: `user${i + 1}@example.com`,
      is_pro: i % 4 !== 0,
      product_identifier: i % 3 === 0 ? 'lumo_pro_yearly' : i % 3 === 1 ? 'lumo_pro_monthly' : 'lumo_pro_weekly',
      period_type: i % 3 === 0 ? 'yearly' : i % 3 === 1 ? 'monthly' : 'weekly',
      will_renew: i % 5 !== 0,
      expires_date: new Date(baseTime + (i * 86400000)).toISOString(),
      created_at: new Date(baseTime - (i * 86400000)).toISOString()
    }))
  } else {
    const { data, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    subscriptions = data || []
    error = fetchError
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading subscriptions: {error.message}</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {isDemo && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
          <span className="flex h-2 w-2 relative mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Demo Mode is active. Showing mock data.
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            A list of all user subscriptions, showing PRO status and renewal dates. Showing latest 100.
          </p>
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
              {subscriptions?.map((sub) => (
                <tr key={`${sub.app_user_id}-${sub.created_at}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="font-medium text-slate-900">{sub.email || 'Unknown'}</div>
                    <div className="text-slate-500 text-xs">{sub.app_user_id?.substring(0, 12)}...</div>
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
              {(!subscriptions || subscriptions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
