import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { getHabits, getTodayLogs, getHabitStats } from '@/features/habits/actions'
import { getLocalDateString } from '@/features/habits/utils/schedule'
import type { Habit, HabitMood } from '@/types/database'
import { LoginButton } from '@/features/auth/components/LoginButton'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // 로그인 전: 심플하고 프리미엄한 로그인 유도 화면
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in zoom-in duration-700">
          <div className="mb-10">
            <div className="mb-4 text-7xl drop-shadow-xl animate-bounce">🌻</div>
            <h1 className="mb-3 text-4xl font-black text-slate-900 tracking-tight">HabbitMaker</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              당신의 습관을 게임처럼,<br />성장을 찬란한 기록으로 만드세요.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-10 shadow-2xl shadow-green-100 border border-green-50 transition-all hover:shadow-green-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">지금 바로 시작하기</h2>
            <LoginButton />
          </div>

          <p className="mt-12 text-sm text-slate-300">
            © 2026 HabbitMaker. Start your journey today.
          </p>
        </div>
      </div>
    )
  }

  // 로그인 후: 대시보드 바로 표시
  const localDate = getLocalDateString()
  const [habitsResult, logsResult, statsResult] = await Promise.all([
    getHabits(),
    getTodayLogs(localDate),
    getHabitStats()
  ])

  const habits: Habit[] = habitsResult.data ?? []
  const todayLogs = logsResult.data ?? []
  const completedHabitIds: string[] = todayLogs.map(l => l.habit_id)
  const completedTimesMap: Record<string, string> = Object.fromEntries(
    todayLogs.map(l => [l.habit_id, l.created_at])
  )
  const completedNotesMap: Record<string, { mood: HabitMood | null; comment: string | null }> =
    Object.fromEntries(todayLogs.map(l => [l.habit_id, { mood: l.mood as HabitMood | null, comment: l.comment }]))
  const allLogs = statsResult?.logs ?? []

  return (
    <DashboardShell
      habits={habits}
      completedHabitIds={completedHabitIds}
      completedTimesMap={completedTimesMap}
      completedNotesMap={completedNotesMap}
      allLogs={allLogs}
      localDate={localDate}
      userEmail={user?.email}
      avatarUrl={user?.user_metadata?.avatar_url as string | undefined}
    />
  )
}
