// Design Ref: §3.1 — 도메인 타입 정의. Phase 2에서 Profile에 coins/xp/level 추가 예정.

export interface Profile {
  id: string
  email: string
  avatar_url: string | null
  is_admin?: string
  created_at: string
}

export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  user_id: string
  title: string
  frequency: HabitFrequency
  frequency_days: number[]  // 0=일, 1=월, ..., 6=토 (weekly일 때만 사용)
  created_at: string
  deleted_at: string | null
  color: string
}

export type HabitMood = '만족' | '보통' | '불만족'

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  log_date: string  // 'YYYY-MM-DD' — 클라이언트 현지 날짜
  created_at: string
  mood: HabitMood | null
  comment: string | null
}

// Plan SC: Server Actions 반환 타입 통일 (항상 { data, error } 형태)
export type ActionResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string }
