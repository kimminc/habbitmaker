'use client'

import { motion } from 'framer-motion'
import { format, subDays, startOfToday, eachDayOfInterval } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BarChart3, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'
import type { Habit } from '@/types/database'

interface HabitStatsProps {
  habits: Habit[]
  completedHabitIds: string[]
  allLogs: any[]
}

export function HabitStats({ habits, completedHabitIds, allLogs }: HabitStatsProps) {
  const today = startOfToday()

  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = allLogs.filter(log => log.log_date === dateStr).length
    return { date: format(date, 'EEE', { locale: ko }), count }
  })

  const totalCompletions = allLogs.length
  const activeHabits = habits.length
  const averageCompletion = activeHabits > 0
    ? Math.round((totalCompletions / (activeHabits * 30)) * 100)
    : 0

  return (
    <div className="space-y-8 pb-10">
      {/* 요약 메트릭 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-green-400 to-green-600 p-6 text-white shadow-lg shadow-green-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium opacity-80">
            <CheckCircle2 className="h-4 w-4" />
            30일 총 완료
          </div>
          <div className="text-4xl font-bold">
            {totalCompletions}
            <span className="ml-1 text-lg font-normal opacity-70">회</span>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
            <TrendingUp className="h-4 w-4 text-green-500" />
            월간 달성률
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {averageCompletion}
            <span className="ml-1 text-lg font-normal text-gray-400 dark:text-gray-500">%</span>
          </div>
        </div>
      </div>

      {/* 주간 리포트 */}
      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            <BarChart3 className="h-5 w-5 text-green-500" />
            주간 리포트
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">최근 7일 현황</span>
        </div>

        <div className="flex h-48 items-end justify-between gap-3 px-2">
          {last7Days.map((day, i) => {
            const height = activeHabits > 0 ? (day.count / activeHabits) * 100 : 0
            return (
              <div key={day.date + i} className="group flex flex-1 flex-col items-center">
                <div className="relative flex h-full w-full flex-col justify-end">
                  <div className="absolute inset-x-0 bottom-0 h-full w-full rounded-t-xl bg-gray-50 dark:bg-gray-700/40" />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'circOut' }}
                    className={`relative z-10 w-full rounded-t-xl ${height > 0 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    {height > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-600">
                        {day.count}개
                      </div>
                    )}
                  </motion.div>
                </div>
                <span className="mt-4 text-xs font-bold text-gray-500 dark:text-gray-400">{day.date}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 습관별 달성 현황 */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 px-1 text-lg font-bold text-gray-900 dark:text-gray-100">
          <Calendar className="h-5 w-5 text-orange-400" />
          습관별 달성 현황
        </h3>

        <div className="grid gap-4">
          {habits.map((habit, i) => {
            const count = allLogs.filter(l => l.habit_id === habit.id).length
            const percentage = Math.min(Math.round((count / 30) * 100), 100)
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-green-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 transition-colors group-hover:text-green-600 dark:text-gray-200 dark:group-hover:text-green-400">
                      {habit.title}
                    </h4>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">최근 30일 중 {count}일 성공</p>
                  </div>
                  <span className="text-lg font-black text-gray-900 dark:text-gray-100">{percentage}%</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
