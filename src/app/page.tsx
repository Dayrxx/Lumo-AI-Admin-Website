import { supabaseAdmin } from '@/utils/supabase/admin'
import { DateRangePicker } from '@/components/DateRangePicker'
import { getDateRange } from '@/utils/date'
import { ArrowDownToLine, DollarSign, Users, Activity, TrendingUp, Smartphone, Star, ShieldCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import { getAppleApps, getAppleAppMetrics } from '@/utils/apple'

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

  // Fetch Apple Apps (Filtered to ai.lumo.productscanner)
  const appleApps = await getAppleApps()
  const lumoApp = appleApps?.[0]
  
  let appleMetrics = null
  if (lumoApp) {
    appleMetrics = await getAppleAppMetrics(lumoApp.id)
  }

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

  // Extract version info if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestVersion = appleMetrics?.included?.find((inc: any) => inc.type === 'appStoreVersions')?.attributes?.versionString || '1.0.0'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appState = appleMetrics?.included?.find((inc: any) => inc.type === 'appStoreVersions')?.attributes?.appStoreState || 'READY_FOR_SALE'

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
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
          <p className="text-sm text-slate-500 mt-1">Track your app&apos;s performance and growth.</p>
        </div>
        <DateRangePicker />
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-2 sm:p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{stat.name}</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lumo App Status Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">App Store Status</h2>
            <Smartphone className="h-5 w-5 text-slate-400" />
          </div>
          
          {lumoApp ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-sm flex items-center justify-center text-white">
                  <span className="text-2xl font-bold">L</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{lumoApp.attributes.name}</h3>
                  <p className="text-sm text-slate-500">{lumoApp.attributes.bundleId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${appState === 'READY_FOR_SALE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {appState.replace(/_/g, ' ')}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Current Version</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    v{latestVersion}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                <span className="text-slate-500">SKU</span>
                <span className="font-medium text-slate-900">{lumoApp.attributes.sku}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Smartphone className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm max-w-[250px]">
                Connect your Apple Developer account to see live app status.
              </p>
            </div>
          )}
        </div>

        {/* Database Stats Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Database Insights</h2>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-medium text-slate-700">Total Registered Users</span>
              </div>
              <span className="text-lg font-bold text-indigo-900">{isDemo ? '12,450' : signupsCount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="font-medium text-slate-700">Active Pro Subscriptions</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">{isDemo ? '3,120' : newSubscriptionsCount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium text-slate-700">Avg. Conversion Rate</span>
              </div>
              <span className="text-lg font-bold text-purple-900">{isDemo ? '25.1%' : `${conversionRate}%`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
