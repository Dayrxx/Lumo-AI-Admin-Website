import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { SubscriptionsClient } from './SubscriptionsClient'

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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-8">
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
      
      <SubscriptionsClient initialSubscriptions={subscriptions} />
    </div>
  )
}
