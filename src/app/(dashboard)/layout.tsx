import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Design Ref: §2.2 — 인증 보호 레이아웃. middleware.ts와 이중 보호.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
