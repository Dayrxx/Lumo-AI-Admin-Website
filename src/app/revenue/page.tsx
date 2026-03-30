import { DollarSign, TrendingUp, Users, AlertCircle, RefreshCw, Activity, ArrowUpRight, ArrowDownToLine } from 'lucide-react'
import { cookies } from 'next/headers'

async function getRevenueCatMetrics(isDemo: boolean) {
  if (isDemo) {
    return {
      data: {
        active_subscriptions: 1420,
        active_trials: 345,
        mrr: 12500.50,
        revenue_28d: 14200.75,
        installs_28d: 4500,
        active_users_28d: 8900,
        conversion_rate: 0.125,
        churn_rate: 0.042,
        mock: true
      }
    }
  }

  const apiKey = process.env.REVENUECAT_SECRET_KEY
  const projectId = process.env.REVENUECAT_PROJECT_ID

  if (!apiKey || !projectId) {
    return { error: 'RevenueCat credentials not configured.' }
  }

  try {
    const res = await fetch(`https://api.revenuecat.com/v2/projects/${projectId}/metrics/overview`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      if (errorData?.type === 'authorization_error') {
        return { error: "Legacy API Key detected. RevenueCat v2 API requires a new 'v2' API key. Please generate a new v2 key in your RevenueCat Dashboard." }
      }
      return { error: `Failed to fetch RevenueCat data: ${res.statusText}` }
    }

    const data = await res.json()
    return { data }
  } catch {
    return { error: 'Failed to connect to RevenueCat API.' }
  }
}

export default async function RevenuePage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  const { data, error } = await getRevenueCatMetrics(isDemo)

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
          <h1 className="text-2xl font-bold text-slate-900">RevenueCat Metrics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your app&apos;s financial performance directly from RevenueCat.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-6 border border-red-100">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-red-800">Action Required</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-4 font-medium">How to fix:</p>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Go to RevenueCat Dashboard</li>
                  <li>Navigate to Project Settings  API Keys</li>
                  <li>Generate a new &quot;v2&quot; Secret API Key</li>
                  <li>Update your <code>.env.local</code> file: <code>REVENUECAT_SECRET_KEY=...</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-100">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">MRR</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">${data?.mrr?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-100">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Revenue (28d)</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">${data?.revenue_28d?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-indigo-100">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Active Subs</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.active_subscriptions?.toLocaleString() || '0'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-100">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Active Trials</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.active_trials?.toLocaleString() || '0'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-100">
                <ArrowDownToLine className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Installs (28d)</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.installs_28d?.toLocaleString() || '0'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-cyan-100">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Active Users</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.active_users_28d?.toLocaleString() || '0'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-rose-100">
                <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Conv. Rate</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.conversion_rate ? (data.conversion_rate * 100).toFixed(1) : '0.0'}%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">Churn Rate</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{data?.churn_rate ? (data.churn_rate * 100).toFixed(1) : '0.0'}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
