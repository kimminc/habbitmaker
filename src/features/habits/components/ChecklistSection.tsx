'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutGroup } from 'framer-motion'
import { ChecklistItem } from './ChecklistItem'
import { WeeklyLineChart } from './WeeklyLineChart'
import { CelebrationModal } from './CelebrationModal'
import { shouldShowToday } from '../utils/schedule'
import type { Habit, HabitMood } from '@/types/database'
import { Sparkles, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'

interface ChecklistSectionProps {
  habits: Habit[]
  completedHabitIds: string[]
  completedTimesMap?: Record<string, string>
  completedNotesMap?: Record<string, { mood: HabitMood | null; comment: string | null }>
  allLogs?: any[]
  localDate: string
}

const XP_PER_LOG = 10

export function ChecklistSection({
  habits,
  completedHabitIds,
  completedTimesMap = {},
  completedNotesMap = {},
  allLogs = [],
  localDate,
}: ChecklistSectionProps) {
  const todayHabits = habits.filter(shouldShowToday)

  const [completedSet, setCompletedSet] = useState<Set<string>>(
    () => new Set(completedHabitIds)
  )
  const [timesMap, setTimesMap] = useState<Record<string, string>>(
    () => ({ ...completedTimesMap })
  )
  const [notesMap, setNotesMap] = useState<Record<string, { mood: HabitMood | null; comment: string | null }>>(
    () => ({ ...completedNotesMap })
  )
  const [showCelebration, setShowCelebration] = useState(false)

  const remainingCount = todayHabits.length - completedSet.size
  const prevRemainingRef = useRef(remainingCount)
  const userActionRef = useRef(false)

  useEffect(() => {
    if (prevRemainingRef.current > 0 && remainingCount === 0 && todayHabits.length > 0 && userActionRef.current) {
      setShowCelebration(true)
    }
    prevRemainingRef.current = remainingCount
    userActionRef.current = false
  }, [remainingCount, todayHabits.length])

  const handleToggle = (
    id: string,
    completed: boolean,
    completedAt?: string,
    mood?: HabitMood | null,
    comment?: string | null
  ) => {
    userActionRef.current = true
    setCompletedSet(prev => {
      const next = new Set(prev)
      completed ? next.add(id) : next.delete(id)
      return next
    })
    if (completed) {
      if (completedAt) setTimesMap(prev => ({ ...prev, [id]: completedAt }))
      setNotesMap(prev => ({ ...prev, [id]: { mood: mood ?? null, comment: comment ?? null } }))
    } else {
      setTimesMap(prev => { const n = { ...prev }; delete n[id]; return n })
      setNotesMap(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  // 완료 / 미완료 분리
  const completedHabits = todayHabits.filter(h => completedSet.has(h.id))
  const incompleteHabits = todayHabits.filter(h => !completedSet.has(h.id))

  const totalXP = allLogs.length * XP_PER_LOG
  const xpGained = todayHabits.length * XP_PER_LOG

  const renderCard = (habit: Habit) => (
    <ChecklistItem
      key={habit.id}
      habit={habit}
      isCompleted={completedSet.has(habit.id)}
      completedAt={timesMap[habit.id]}
      mood={notesMap[habit.id]?.mood}
      comment={notesMap[habit.id]?.comment}
      date={localDate}
      onToggle={handleToggle}
    />
  )

  return (
    <div className="space-y-8">
      <CelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        completedCount={todayHabits.length}
        totalXP={totalXP}
        xpGained={xpGained}
      />

      {/* 차트 */}
      <section>
        <WeeklyLineChart logs={allLogs} habits={habits} activeHabitsCount={habits.length} />
      </section>

      {/* 헤더 */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white tracking-tight">
            <CalendarDays className="h-5 w-5 text-green-500" />
            오늘의 도전
          </h3>
          <p className="mt-1.5 flex items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1 text-green-500">✅ 완료 {completedSet.size}개</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-400">⏳ 미완료 {remainingCount}개</span>
            {remainingCount === 0 && todayHabits.length > 0 && (
              <span className="text-orange-400">🎉 모두 달성!</span>
            )}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
          <Sparkles className="h-3 w-3" />
          LEVEL UP
        </span>
      </div>

      {/* 카드 리스트 */}
      {todayHabits.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border-2 border-dashed border-gray-100 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-gray-400 font-medium dark:text-gray-500">
            오늘 예정된 습관이 없네요.<br />새로운 도전을 추가해볼까요? 🌱
          </p>
        </div>
      ) : (
        <LayoutGroup>
          <div className="space-y-6">
            {/* ── 완료된 습관 ── */}
            {completedHabits.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-black text-green-600 dark:text-green-400">
                    완료 {completedHabits.length}
                  </span>
                  <div className="flex-1 h-px bg-green-100 dark:bg-green-900/40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {completedHabits.map(renderCard)}
                </div>
              </section>
            )}

            {/* ── 미완료 습관 ── */}
            {incompleteHabits.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                    미완료 {incompleteHabits.length}
                  </span>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {incompleteHabits.map(renderCard)}
                </div>
              </section>
            )}
          </div>
        </LayoutGroup>
      )}

      {/* 응원 문구 */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white overflow-hidden relative group">
        <div className="relative z-10">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Weekly Insight</p>
          <h4 className="text-lg font-bold leading-tight">작은 반복이 모여<br />위대한 당신을 만듭니다.</h4>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 group-hover:scale-110 transition-transform">
          🌱
        </div>
      </div>
    </div>
  )
}
