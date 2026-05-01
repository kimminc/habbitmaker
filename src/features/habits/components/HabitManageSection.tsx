'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HabitAddModal } from './HabitAddModal'
import { deleteHabit } from '../actions'
import { formatFrequencyLabel } from '../utils/schedule'
import type { Habit } from '@/types/database'
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface HabitManageSectionProps {
  habits: Habit[]
  logs: any[]
  activeSection?: string
  onSectionChange?: (section: any) => void
}

export function HabitManageSection({ habits, logs, activeSection, onSectionChange }: HabitManageSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    if (activeSection === 'add') {
      setIsModalOpen(true)
    }
  }, [activeSection])

  const calculateAchievementRate = (habitId: string, createdAt: string) => {
    const habitLogs = logs.filter(l => l.habit_id === habitId)
    const daysSinceCreation = differenceInDays(new Date(), new Date(createdAt)) + 1
    const rate = Math.min(Math.round((habitLogs.length / daysSinceCreation) * 100), 100)
    return rate
  }

  return (
    <div className="relative space-y-6">
      {/* 관리 헤더 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">나의 습관 리스트</h3>
          <p className="text-xs font-bold text-slate-400 mt-1">총 {habits.length}개의 목표가 진행 중입니다.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          습관 추가
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center border-2 border-dashed border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-400 font-bold">아직 등록된 습관이 없습니다.<br/>새로운 도전을 시작해보세요! 🌱</p>
          </div>
        ) : (
          habits.map((habit, i) => {
            const rate = calculateAchievementRate(habit.id, habit.created_at)
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setEditingHabit(habit)
                  setIsModalOpen(true)
                }}
                className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] p-7 border transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-slate-900"
                style={{ 
                  background: `linear-gradient(145deg, ${habit.color}08, ${habit.color}15)`,
                  borderColor: habit.color + '25',
                  boxShadow: `0 10px 30px -10px ${habit.color}20`
                } as any}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="rounded-lg px-2 py-1 text-[10px] font-black"
                        style={{ backgroundColor: habit.color + '15', color: habit.color }}
                      >
                        {formatFrequencyLabel(habit)}
                      </span>
                      <h4 className="text-base font-black text-slate-800 dark:text-slate-100">{habit.title}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>시작: {format(new Date(habit.created_at), 'yyyy.MM.dd')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: habit.color }}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>성취율: {rate}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation() // 카드 클릭(수정) 이벤트와 겹치지 않게 방지
                      if (confirm('정말 이 습관을 삭제하시겠습니까?')) {
                        deleteHabit(habit.id)
                      }
                    }}
                    className="rounded-xl p-3 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* 진도율 바 */}
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-50 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full shadow-sm"
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <HabitAddModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingHabit(null)
          if (activeSection === 'add') {
            onSectionChange?.('manage')
          }
        }}
        existingHabits={habits}
        habitToEdit={editingHabit}
      />
    </div>
  )
}
