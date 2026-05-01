import { getHabitStats } from '@/features/habits/actions'
import { format, subDays, startOfToday, eachDayOfInterval } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BarChart3, Calendar, CheckCircle2, TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function StatsPage() {
  const stats = await getHabitStats()
  if (!stats) return null

  const { habits, logs } = stats
  const today = startOfToday()
  
  // 최근 7일 데이터 가공
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = logs.filter(log => log.log_date === dateStr).length
    return {
      date: format(date, 'EEE', { locale: ko }),
      fullDate: dateStr,
      count
    }
  })

  const totalCompletions = logs.length
  const activeHabits = habits.length
  const averageCompletion = activeHabits > 0 
    ? Math.round((totalCompletions / (activeHabits * 30)) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <Link href="/dashboard" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">습관 통계</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-4 space-y-6">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-gradient-to-br from-green-400 to-green-600 p-5 text-white shadow-lg shadow-green-100">
            <div className="flex items-center gap-2 opacity-80 mb-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              총 완료 횟수
            </div>
            <div className="text-3xl font-bold">{totalCompletions}회</div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              달성률 (30일)
            </div>
            <div className="text-3xl font-bold text-gray-900">{averageCompletion}%</div>
          </div>
        </div>

        {/* 주간 진행도 그래프 */}
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              주간 리포트
            </h2>
            <span className="text-xs text-gray-400">최근 7일</span>
          </div>
          
          <div className="flex items-end justify-between h-40 gap-2 px-2">
            {last7Days.map((day, i) => {
              const height = activeHabits > 0 ? (day.count / activeHabits) * 100 : 0
              return (
                <div key={day.fullDate} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="w-full max-w-[32px] bg-green-100 rounded-t-lg transition-all duration-500 group-hover:bg-green-200"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div 
                        className="absolute bottom-0 w-full bg-green-500 rounded-t-lg transition-all duration-700"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    {/* 툴팁 */}
                    <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.count}개 완료
                    </div>
                  </div>
                  <span className="mt-3 text-xs text-gray-500 font-medium">{day.date}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* 습관별 상세 현황 */}
        <section className="space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 px-1">
            <Calendar className="h-5 w-5 text-orange-400" />
            습관별 달성 현황
          </h2>
          
          <div className="space-y-3">
            {habits.map(habit => {
              const habitLogs = logs.filter(l => l.habit_id === habit.id)
              const count = habitLogs.length
              const percentage = Math.min(Math.round((count / 30) * 100), 100)
              
              return (
                <div key={habit.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{habit.title}</h3>
                      <p className="text-xs text-gray-400">{habit.frequency === 'daily' ? '매일' : '주간'}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">{count}회</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-400">최근 30일 달성도</span>
                    <span className="text-[10px] text-gray-500 font-medium">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {habits.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400">데이터가 아직 부족해요. 습관을 먼저 만들어보세요! 🌱</p>
          </div>
        )}
      </div>
    </div>
  )
}
