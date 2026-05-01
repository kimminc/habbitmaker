'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createHabit, updateHabit } from '../actions'
import { FrequencyDaysPicker } from './FrequencyDaysPicker'
import type { Habit, HabitFrequency } from '@/types/database'
import { X, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface HabitAddModalProps {
  isOpen: boolean
  onClose: () => void
  existingHabits: Habit[]
  habitToEdit?: Habit | null
}

export function HabitAddModal({ isOpen, onClose, existingHabits, habitToEdit }: HabitAddModalProps) {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [frequencyDays, setFrequencyDays] = useState<number[]>([])
  const [selectedColor, setSelectedColor] = useState('#10b981')
  const [isPending, startTransition] = useTransition()

  // 수정 모드일 경우 초기값 설정
  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title)
      setFrequency(habitToEdit.frequency)
      setFrequencyDays(habitToEdit.frequency_days)
      setSelectedColor(habitToEdit.color)
    } else {
      setTitle('')
      setFrequency('daily')
      setFrequencyDays([])
      setSelectedColor('#10b981')
    }
  }, [habitToEdit, isOpen])

  const PRESET_COLORS = [
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f97316', // Orange
    '#eab308', // Yellow
    '#6366f1', // Indigo
    '#f43f5e', // Rose
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 중복 체크 (수정 중인 습관은 제외)
    const isDuplicate = existingHabits.some(h => 
      h.title.trim() === title.trim() && h.id !== habitToEdit?.id
    )
    if (isDuplicate) {
      toast.error('이미 동일한 이름의 습관이 있습니다! 🙅‍♂️', {
        icon: <AlertCircle className="text-red-500" />,
      })
      return
    }

    startTransition(async () => {
      const result = habitToEdit 
        ? await updateHabit(habitToEdit.id, title, frequency, frequencyDays, selectedColor)
        : await createHabit(title, frequency, frequencyDays, selectedColor)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(habitToEdit ? '습관 수정 완료! ✨' : '새 습관 등록 완료! 🎉', {
          icon: <CheckCircle2 className="text-green-500" />,
        })
        if (!habitToEdit) {
          setTitle('')
          setFrequency('daily')
          setFrequencyDays([])
          setSelectedColor('#10b981')
        }
        onClose()
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-40%' }}
            className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md rounded-[3rem] bg-white p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-slate-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {habitToEdit ? '✏️ 습관 수정하기' : '🌱 새 습관 추가하기'}
              </h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 습관명 입력 (Dropdown + Key-in) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">습관 이름</label>
                <div className="relative">
                  <input
                    type="text"
                    list="existing-habits"
                    placeholder="직접 입력하거나 선택하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none focus:ring-4 focus:ring-green-400/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                  <datalist id="existing-habits">
                    {existingHabits.map((h) => (
                      <option key={h.id} value={h.title} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 빈도 선택 */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">반복 주기</label>
                <div className="flex gap-2">
                  {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${
                        frequency === f
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {f === 'daily' ? '매일 반복' : '특정 요일'}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === 'weekly' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <FrequencyDaysPicker selectedDays={frequencyDays} onChange={setFrequencyDays} />
                </motion.div>
              )}

              {/* 색상 선택 */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">대표 색상</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full transition-all hover:scale-110 active:scale-95 ${
                        selectedColor === color 
                          ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900' 
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: color,
                        '--tw-ring-color': color 
                      } as any}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || !title.trim()}
                className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 py-4 text-sm font-black text-white transition-all hover:bg-black disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isPending 
                    ? '처리 중...' 
                    : habitToEdit 
                      ? <><CheckCircle2 className="h-4 w-4" /> 정보 수정하기</>
                      : <><PlusCircle className="h-4 w-4" /> 습관 등록하기</>
                  }
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
