import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

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
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Demographics</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Goal</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users?.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {person.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-slate-900">{person.email || 'Anonymous'}</div>
                        <div className="text-slate-500 text-xs">{person.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="text-sm text-slate-900">{person.gender || '-'}</div>
                    <div className="text-xs text-slate-500">{person.age ? `${person.age} years` : '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {person.weight_goal || 'None'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {person.device_brand} {person.device_model}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {new Date(person.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No profiles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
