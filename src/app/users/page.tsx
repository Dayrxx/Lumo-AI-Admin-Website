import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { UsersClient } from './UsersClient'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_mode')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = []
  let error = null

  if (isDemo) {
    const baseTime = 1711843200000
    users = Array.from({ length: 15 }).map((_, i) => ({
      id: `demo-user-${i}`,
      email: `user${i + 1}@example.com`,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      age: 20 + (i % 30),
      weight_goal: i % 3 === 0 ? 'Lose Weight' : i % 3 === 1 ? 'Build Muscle' : 'Maintain',
      device_brand: i % 4 === 0 ? 'Samsung' : 'Apple',
      device_model: i % 4 === 0 ? 'Galaxy S24' : 'iPhone 15 Pro',
      created_at: new Date(baseTime - (i * 86400000)).toISOString()
    }))
  } else {
    const { data, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    users = data || []
    error = fetchError
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading users: {error.message}</div>
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
          <h1 className="text-2xl font-bold text-slate-900">Users (Profiles)</h1>
          <p className="mt-1 text-sm text-slate-500">
            A list of all users in your app. Showing the latest 100 signups.
          </p>
        </div>
      </div>
      
      <UsersClient initialUsers={users} />
    </div>
  )
}
