import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LumoDash | Admin',
  description: 'Admin Dashboard for Lumo AI',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get('demo_mode')?.value === 'true'

  return (
    <html lang="en" className="h-full bg-[#F8FAFC]">
      <body className={`${inter.className} h-full text-slate-900 overflow-hidden`}>
        <div className="flex h-full flex-col md:flex-row">
          <Sidebar isDemoMode={isDemoMode} />
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
