import { supabaseAdmin } from '@/utils/supabase/admin'
import { DateRangePicker } from '@/components/DateRangePicker'
import { getDateRange } from '@/utils/date'
import { ArrowDownToLine, DollarSign, Users, Activity, TrendingUp } from 'lucide-react'
import { cookies } from 'next/headers'

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = params.range || '7d'
  const { start, end } = getDateRange(range)

  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  let signupsCount = 0
  let newSubscriptionsCount = 0
  let estimatedRevenue = 0
  let conversionRate = '0.0'

  if (isDemo) {
    // Generate realistic fake data based on range
    const multipliers: Record<string, number> = {
      '12h': 0.5, '24h': 1, 'yesterday': 1, '7d': 7, '30d': 30, 'all': 180
    }
    const mult = multipliers[range] || 7
    
    signupsCount = Math.floor(124 * mult)
    newSubscriptionsCount = Math.floor(31 * mult)
    estimatedRevenue = 429.50 * mult
    conversionRate = ((newSubscriptionsCount / signupsCount) * 100).toFixed(1)
  } else {
    // Fetch Signups (Profiles) in range
    const { count: fetchedSignupsCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end)
    
    signupsCount = fetchedSignupsCount || 0

    // Fetch Subscriptions in range
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('product_identifier, is_pro')
      .gte('created_at', start)
      .lte('created_at', end)

    newSubscriptionsCount = subscriptions?.length || 0

    // Calculate mock revenue based on product_identifier
    subscriptions?.forEach(sub => {
      if (sub.product_identifier?.toLowerCase().includes('year')) {
        estimatedRevenue += 59.99
      } else if (sub.product_identifier?.toLowerCase().includes('month')) {
        estimatedRevenue += 9.99
      } else if (sub.product_identifier?.toLowerCase().includes('week')) {
        estimatedRevenue += 4.99
      } else if (sub.is_pro) {
        estimatedRevenue += 9.99 // fallback
      }
    })

    conversionRate = signupsCount > 0 
      ? ((newSubscriptionsCount / signupsCount) * 100).toFixed(1) 
      : '0.0'
  }

  const stats = [
    {
      name: 'App Downloads (Signups)',
      value: signupsCount.toLocaleString(),
      icon: ArrowDownToLine,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Estimated Revenue',
      value: `$${estimatedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      name: 'New Subscriptions',
      value: newSubscriptionsCount.toLocaleString(),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      name: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Track your app's performance and growth.</p>
        </div>
        <DateRangePicker />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Signups</h2>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <RecentSignups isDemo={isDemo} />
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
          <h2 className="text-lg font-bold mb-2">Connect Apple App Store</h2>
          <p className="text-indigo-100 text-sm mb-6">
            To get exact App Download numbers and official Revenue data, add your Apple App Store Connect API keys to the environment variables.
          </p>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <code className="text-xs text-indigo-50">
              APPLE_ISSUER_ID=...<br/>
              APPLE_KEY_ID=...<br/>
              APPLE_PRIVATE_KEY=...
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

async function RecentSignups({ isDemo }: { isDemo: boolean }) {
  let recentSignups: any[] = []

  if (isDemo) {
    recentSignups = [
      { id: '1', email: 'alex.smith@example.com', created_at: new Date().toISOString(), device_os: 'iOS 17.4' },
      { id: '2', email: 'sarah.j@example.com', created_at: new Date(Date.now() - 3600000).toISOString(), device_os: 'iOS 17.3' },
      { id: '3', email: 'mike.williams@example.com', created_at: new Date(Date.now() - 7200000).toISOString(), device_os: 'Android 14' },
      { id: '4', email: 'emily.brown@example.com', created_at: new Date(Date.now() - 10800000).toISOString(), device_os: 'iOS 17.4' },
      { id: '5', email: 'david.c@example.com', created_at: new Date(Date.now() - 14400000).toISOString(), device_os: 'Android 13' },
    ]
  } else {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id, email, created_at, device_os')
      .order('created_at', { ascending: false })
      .limit(5)
    recentSignups = data || []
  }

  if (!recentSignups || recentSignups.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4">No recent signups.</p>
  }

  return (
    <div className="space-y-4">
      {recentSignups.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.email || 'Anonymous'}</p>
              <p className="text-xs text-slate-500">{user.device_os || 'Unknown Device'}</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
