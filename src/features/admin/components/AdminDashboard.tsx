'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, CheckCircle2, ListChecks, TrendingUp, 
  Calendar, ShieldCheck, User as UserIcon,
  ChevronDown, ChevronUp, Check, X, Clock,
  MessageSquare, Send, Smile, Meh, Frown
} from 'lucide-react'
import { format } from 'date-fns'
import { updateAdminComment } from '@/features/admin/actions'

interface HabitDetail {
  id: string
  title: string
  color: string
  isCompleted: boolean
  mood: string | null
  comment: string | null
  adminComment: string | null
}

interface UserStat {
  id: string
  email: string
  is_admin: boolean
  createdAt: string
  habitCount: number
  logCount: number
  completionRate: number
  todayDetails: HabitDetail[]
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
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  const cards = [
    { label: '전체 사용자', value: summary.totalUsers, unit: '명', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: '전체 습관', value: summary.totalHabits, unit: '개', icon: ListChecks, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: '오늘 완료', value: summary.todayLogs, unit: '회', icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { label: '평균 달성률', value: summary.averageCompletion, unit: '%', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  ]

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
  }

  const handleReplyChange = (habitId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [habitId]: value }))
  }

  const submitReply = async (userId: string, habitId: string, currentVal: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    setIsSubmitting(habitId)
    const { error } = await updateAdminComment(userId, habitId, todayStr, currentVal)
    setIsSubmitting(null)
    if (!error) {
      alert('응원 메시지를 남겼습니다! 🐟✨')
    } else {
      alert('저장에 실패했습니다: ' + error)
    }
  }

  const moodIcon = (mood: string | null) => {
    if (mood === '만족') return <Smile className="text-emerald-500" size={16} />
    if (mood === '보통') return <Meh className="text-amber-500" size={16} />
    if (mood === '불만족') return <Frown className="text-rose-500" size={16} />
    return null
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Summary Cards */}
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
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${card.bg} opacity-10 blur-2xl`} />
          </motion.div>
        ))}
      </div>

      {/* User Stats Table */}
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
                <React.Fragment key={user.id}>
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    onClick={() => toggleExpand(user.id)}
                    className={`group cursor-pointer transition-colors ${expandedUserId === user.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}`}
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
                            transition={{ duration: 1 }}
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
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 transition-all">
                        {expandedUserId === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expandable Details Area */}
                  <AnimatePresence>
                    {expandedUserId === user.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td colSpan={5} className="px-8 py-0">
                          <div className="pb-8 pt-2">
                            <div className="rounded-[1.5rem] bg-gray-50/80 p-6 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-700/50 space-y-6">
                              {/* Completed Habits Section */}
                              <div>
                                <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <CheckCircle2 size={12} /> 완료된 습관
                                </h4>
                                <div className="space-y-3">
                                  {user.todayDetails.filter(h => h.isCompleted).length > 0 ? (
                                    user.todayDetails.filter(h => h.isCompleted).map((habit) => (
                                      <div key={habit.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 border border-gray-100/50 dark:border-gray-800/50">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color }} />
                                            <span className="font-bold text-gray-900 dark:text-white">{habit.title}</span>
                                            {habit.mood && (
                                              <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                                {moodIcon(habit.mood)}
                                                <span className="text-[10px] font-bold text-gray-500">{habit.mood}</span>
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/50">COMPLETED</span>
                                        </div>
                                        
                                        {/* User Comment */}
                                        <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50 italic text-sm text-gray-600 dark:text-gray-400">
                                          "{habit.comment || '남긴 코멘트가 없습니다.'}"
                                        </div>

                                        {/* Admin Reply Area */}
                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                          <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/50">
                                              <MessageSquare size={16} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">관리자 응원 메시지</p>
                                              <div className="relative">
                                                <input 
                                                  type="text" 
                                                  placeholder="응원 한마디 남겨주세요..."
                                                  defaultValue={habit.adminComment || ''}
                                                  onChange={(e) => handleReplyChange(habit.id, e.target.value)}
                                                  className="w-full rounded-xl border-none bg-gray-50 px-4 py-2.5 pr-12 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                                />
                                                <button 
                                                  onClick={() => submitReply(user.id, habit.id, replyInputs[habit.id] ?? habit.adminComment ?? '')}
                                                  disabled={isSubmitting === habit.id}
                                                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                                                >
                                                  {isSubmitting === habit.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /> : <Send size={16} />}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm font-medium text-gray-400 py-2">아직 완료된 습관이 없습니다.</p>
                                  )}
                                </div>
                              </div>

                              {/* Uncompleted Habits Section */}
                              <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <X size={12} /> 미완료 습관
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {user.todayDetails.filter(h => !h.isCompleted).length > 0 ? (
                                    user.todayDetails.filter(h => !h.isCompleted).map((habit) => (
                                      <div 
                                        key={habit.id}
                                        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-gray-900 border border-gray-100/50 dark:border-gray-800/50"
                                      >
                                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: habit.color }} />
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{habit.title}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm font-medium text-emerald-500 py-2">오늘 모든 습관을 완료했습니다! ✨</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
