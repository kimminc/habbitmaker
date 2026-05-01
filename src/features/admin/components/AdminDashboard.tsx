'use client'

import { motion } from 'framer-motion'
import { 
  Users, CheckCircle2, ListChecks, TrendingUp, 
  Mail, Calendar, ShieldCheck, User as UserIcon,
  ChevronRight, ArrowUpRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface UserStat {
  id: string
  email: string
  is_admin: boolean
  createdAt: string
  habitCount: number
  logCount: number
  completionRate: number
}

interface AdminDashboardProps {
  data: {
    summary: {
      totalUsers: number
      totalHabits: number
      todayLogs: number
      averageCompletion: number
    }
    userStats: UserStat[]
  }
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const { summary, userStats } = data

  const cards = [
    { label: '전체 사용자', value: summary.totalUsers, unit: '명', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: '전체 습관', value: summary.totalHabits, unit: '개', icon: ListChecks, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: '오늘 완료', value: summary.todayLogs, unit: '회', icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { label: '평균 달성률', value: summary.averageCompletion, unit: '%', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* 요약 카드 그리드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</span>
              <span className="text-sm font-bold text-gray-400">{card.unit}</span>
            </div>
            
            {/* 장식용 배경 */}
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${card.bg} opacity-10 blur-2xl`} />
          </motion.div>
        ))}
      </div>

      {/* 사용자별 성취도 리스트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-[2.5rem] bg-white shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden"
      >
        <div className="border-b border-gray-50 p-8 dark:border-gray-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">사용자별 성취도</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">최근 30일 활동 기준 분석</p>
          </div>
          <div className="rounded-full bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
            총 {userStats.length}명
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">사용자 정보</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">습관/기록</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">달성률</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">가입일</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {userStats.map((user, i) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:scale-110 transition-transform">
                        {user.is_admin ? <ShieldCheck className="text-emerald-500" size={20} /> : <UserIcon size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {user.email}
                          {user.is_admin && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full dark:bg-emerald-950/50">ADMIN</span>}
                        </p>
                        <p className="text-xs font-medium text-gray-400 truncate max-w-[150px]">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{user.habitCount}</span>
                        <span className="text-[10px] font-bold text-gray-400">습관</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{user.logCount}</span>
                        <span className="text-[10px] font-bold text-gray-400">완료</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${user.completionRate}%` }}
                          transition={{ duration: 1, delay: 0.8 + i * 0.05 }}
                          className={`h-full rounded-full ${
                            user.completionRate > 70 ? 'bg-emerald-500' : 
                            user.completionRate > 30 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-black ${
                        user.completionRate > 70 ? 'text-emerald-600' : 
                        user.completionRate > 30 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {user.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="opacity-50" />
                      {format(new Date(user.createdAt), 'yy.MM.dd')}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all hidden group-hover:flex">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
