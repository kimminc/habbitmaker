'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfToday, subDays, format, differenceInDays } from 'date-fns'

export async function getAdminDashboardData() {
  const supabase = createClient()
  
  // 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin !== true) {
    return { data: null, error: '관리자 권한이 없습니다.' }
  }

  // 데이터 조회 (최근 30일 기준)
  const thirtyDaysAgo = format(subDays(startOfToday(), 30), 'yyyy-MM-dd')

  const [profilesRes, habitsRes, logsRes] = await Promise.all([
    supabase.from('profiles').select('id, email, is_admin, created_at').order('created_at', { ascending: false }),
    supabase.from('habits').select('id, user_id, title, created_at').is('deleted_at', null),
    supabase.from('habit_logs').select('user_id, log_date').gte('log_date', thirtyDaysAgo)
  ])

  if (profilesRes.error) return { data: null, error: profilesRes.error.message }
  
  const allProfiles = profilesRes.data || []
  const allHabits = habitsRes.data || []
  const allLogs = logsRes.error ? [] : (logsRes.data || [])

  // 사용자별 통계 가공
  const userStats = allProfiles.map(p => {
    const userHabits = allHabits.filter(h => h.user_id === p.id)
    const userLogs = allLogs.filter(l => l.user_id === p.id)
    
    // 가입일로부터 경과일 (최대 30일)
    const daysSinceJoin = Math.min(30, Math.max(1, differenceInDays(startOfToday(), new Date(p.created_at))))
    
    // 이론적 최대 완료 가능 횟수 (습관 수 * 경과일)
    const maxPossible = userHabits.length * daysSinceJoin
    const completionRate = maxPossible > 0 ? Math.round((userLogs.length / maxPossible) * 100) : 0

    return {
      id: p.id,
      email: p.email,
      is_admin: !!p.is_admin,
      createdAt: p.created_at,
      habitCount: userHabits.length,
      logCount: userLogs.length,
      completionRate
    }
  })

  // 요약 정보
  const summary = {
    totalUsers: allProfiles.length,
    totalHabits: allHabits.length,
    todayLogs: allLogs.filter(l => l.log_date === format(startOfToday(), 'yyyy-MM-dd')).length,
    averageCompletion: userStats.length > 0 
      ? Math.round(userStats.reduce((acc, curr) => acc + curr.completionRate, 0) / userStats.length) 
      : 0
  }

  return {
    data: {
      summary,
      userStats
    },
    error: null
  }
}
