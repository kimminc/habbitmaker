import { getAdminDashboardData } from '@/features/admin/actions'
import { AdminDashboard } from '@/features/admin/components/AdminDashboard'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const result = await getAdminDashboardData()

  if (result.error) {
    if (result.error === '로그인이 필요합니다.') {
      redirect('/auth/login')
    }
    // 관리자 권한이 없으면 대시보드로 리다이렉트
    redirect('/dashboard')
  }

  if (!result.data) {
    redirect('/dashboard')
  }

  return (
    <DashboardShell isAdmin initialSection="admin">
      <AdminDashboard data={result.data} />
    </DashboardShell>
  )
}