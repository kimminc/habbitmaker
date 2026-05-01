'use server'

// Design Ref: §4.2 — Habit Server Actions. Application layer.
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Habit, HabitFrequency, HabitMood } from '@/types/database'

export async function getHabits(): Promise<ActionResult<Habit[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as Habit[], error: null }
}

export async function createHabit(
  title: string,
  frequency: HabitFrequency,
  frequencyDays: number[],
  color: string = '#10b981'
): Promise<ActionResult<Habit>> {
  const trimmed = title.trim()
  if (!trimmed || trimmed.length > 100) {
    return { data: null, error: '습관 제목은 1~100자 이내로 입력해주세요.' }
  }
  if (frequency === 'weekly' && frequencyDays.length === 0) {
    return { data: null, error: '주간 반복 시 최소 1개 요일을 선택해주세요.' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      title: trimmed,
      frequency,
      frequency_days: frequency === 'daily' ? [] : frequencyDays,
      color,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard')
  return { data: data as Habit, error: null }
}

export async function updateHabit(
  habitId: string,
  title: string,
  frequency: HabitFrequency,
  frequencyDays: number[],
  color: string
): Promise<ActionResult<Habit>> {
  const trimmed = title.trim()
  if (!trimmed || trimmed.length > 100) {
    return { data: null, error: '습관 제목은 1~100자 이내로 입력해주세요.' }
  }
  if (frequency === 'weekly' && frequencyDays.length === 0) {
    return { data: null, error: '주간 반복 시 최소 1개 요일을 선택해주세요.' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .from('habits')
    .update({
      title: trimmed,
      frequency,
      frequency_days: frequency === 'daily' ? [] : frequencyDays,
      color,
    })
    .eq('id', habitId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard')
  return { data: data as Habit, error: null }
}

export async function deleteHabit(habitId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  // Plan SC: 소프트 삭제 — deleted_at 설정
  const { error } = await supabase
    .from('habits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', user.id)  // RLS 이중 보호

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard')
  return { data: null, error: null }
}

export type TodayLog = {
  habit_id: string
  created_at: string
  mood: string | null
  comment: string | null
}

export async function getTodayLogs(
  localDate: string
): Promise<ActionResult<TodayLog[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, created_at, mood, comment')
    .eq('user_id', user.id)
    .eq('log_date', localDate)

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as TodayLog[], error: null }
}

// Plan SC: 완료 토글 — INSERT or DELETE (UNIQUE constraint로 중복 방지)
export async function toggleHabitLog(
  habitId: string,
  localDate: string,
  isCompleted: boolean,
  mood?: HabitMood | null,
  comment?: string | null
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: '로그인이 필요합니다.' }

  if (isCompleted) {
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('log_date', localDate)
    if (error) return { data: null, error: error.message }
  } else {
    const { error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        log_date: localDate,
        mood: mood ?? null,
        comment: comment?.trim() || null,
      })
    if (error) return { data: null, error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: null, error: null }
}

export async function getHabitStats() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. 최근 30일간의 로그 가져오기
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const [habitsRes, logsRes] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
  ])

  return {
    habits: habitsRes.data || [],
    logs: logsRes.data || []
  }
}
