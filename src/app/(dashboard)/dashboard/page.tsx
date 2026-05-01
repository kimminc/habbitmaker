import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { getHabits, getTodayLogs, getHabitStats } from '@/features/habits/actions'
import { getLocalDateString } from '@/features/habits/utils/schedule'
import type { Habit, HabitMood } from '@/types/database'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const localDate = getLocalDateString()
  const [habitsResult, logsResult, statsResult, profileResult] = await Promise.all([
    getHabits(),
    getTodayLogs(localDate),
    getHabitStats(),
    user ? supabase.from('profiles').select('is_admin').eq('id', user.id).single() : Promise.resolve({ data: null })
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
      isAdmin={profileResult.data?.is_admin === true}
    />
  )
}
