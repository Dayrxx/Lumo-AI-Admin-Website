'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, DollarSign, LogOut, Beaker } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { setDemoMode } from '@/app/demo-actions'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
]

export function Sidebar({ isDemoMode: initialDemoMode }: { isDemoMode: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isDemoMode, setIsDemoMode] = useState(initialDemoMode)
  const [isToggling, setIsToggling] = useState(false)

  if (pathname === '/login') return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleToggleDemo = async () => {
    setIsToggling(true)
    const newValue = !isDemoMode
    setIsDemoMode(newValue)
    await setDemoMode(newValue)
    router.refresh()
    setIsToggling(false)
  }

  return (
    <div className="flex w-64 flex-col bg-white border-r border-slate-200 text-slate-600 transition-all duration-300 shadow-sm z-10">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-slate-100 bg-white">
        <Image 
          src="/lumodash.jpg" 
          alt="LumoDash Logo" 
          width={180} 
          height={60} 
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-100 space-y-2">
          {/* Demo Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center text-sm font-medium text-slate-700">
              <Beaker className="mr-3 h-5 w-5 text-indigo-500" />
              Demo Mode
            </div>
            <button
              onClick={handleToggleDemo}
              disabled={isToggling}
              className={`
                relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                ${isDemoMode ? 'bg-indigo-600' : 'bg-slate-200'}
                ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              role="switch"
              aria-checked={isDemoMode}
            >
              <span className="sr-only">Use demo mode</span>
              <span
                aria-hidden="true"
                className={`
                  pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${isDemoMode ? 'translate-x-4' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
