import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { cookies } from 'next/headers'

async function getRevenueCatMetrics(isDemo: boolean) {
  if (isDemo) {
    return {
      data: {
        active_subscriptions: 1420,
        mrr: 12500.50,
        revenue_28d: 14200.75,
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
  } catch (err) {
    return { error: 'Failed to connect to RevenueCat API.' }
  }
}

export default async function RevenuePage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  const { data, error } = await getRevenueCatMetrics(isDemo)

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
          <h1 className="text-2xl font-bold text-slate-900">RevenueCat Metrics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your app's financial performance directly from RevenueCat.
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
                  <li>Generate a new "v2" Secret API Key</li>
                  <li>Update your <code>.env.local</code> file: <code>REVENUECAT_SECRET_KEY=...</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-indigo-100">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{data?.active_subscriptions?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-slate-500">MRR</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${data?.mrr?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-slate-500">Revenue (28d)</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${data?.revenue_28d?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && !data.mock && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Raw Data</h2>
          <pre className="bg-slate-50 p-4 rounded-xl overflow-x-auto text-sm text-slate-700 border border-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
