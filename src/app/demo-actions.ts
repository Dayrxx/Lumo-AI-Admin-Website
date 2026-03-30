'use server'

import { cookies } from 'next/headers'

export async function setDemoMode(enabled: boolean) {
  const cookieStore = await cookies()
  if (enabled) {
    cookieStore.set('demo_mode', 'true', { path: '/' })
  } else {
    cookieStore.delete('demo_mode')
  }
}
