'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import type { HabitMood } from '@/types/database'

interface CompletionNoteModalProps {
  open: boolean
  habitTitle: string
  habitColor?: string
  onConfirm: (mood: HabitMood | null, comment: string) => void
  onClose: () => void
}

const MOODS: { value: HabitMood; emoji: string; label: string; bg: string; border: string; text: string }[] = [
  {
    value: '만족',
    emoji: '😊',
    label: '만족',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  {
    value: '보통',
    emoji: '😐',
    label: '보통',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    value: '불만족',
    emoji: '😞',
    label: '불만족',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-400',
    text: 'text-red-500 dark:text-red-400',
  },
]

export function CompletionNoteModal({
  open,
  habitTitle,
  habitColor = '#10b981',
  onConfirm,
  onClose,
}: CompletionNoteModalProps) {
  const [mood, setMood] = useState<HabitMood | null>(null)
  const [comment, setComment] = useState('')

  const handleConfirm = () => {
    onConfirm(mood, comment)
    reset()
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  function reset() {
    setMood(null)
    setComment('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{   scale: 0.88, y: 24,  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 상단 컬러 바 */}
            <div className="h-1.5 w-full" style={{ backgroundColor: habitColor }} />

            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    오늘의 기록
                  </p>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {habitTitle}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-3 flex-shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 만족도 선택 */}
              <div className="mb-5">
                <p className="text-xs font-black text-slate-600 dark:text-slate-300 mb-3">
                  오늘의 만족도
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMood(prev => prev === m.value ? null : m.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 px-2 transition-all ${
                        mood === m.value
                          ? `${m.bg} ${m.border} scale-105 shadow-sm`
                          : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <span className="text-2xl leading-none">{m.emoji}</span>
                      <span className={`text-[10px] font-black ${mood === m.value ? m.text : 'text-slate-500 dark:text-slate-400'}`}>
                        {m.label}
                      </span>
                      {mood === m.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`h-1.5 w-1.5 rounded-full ${m.text.replace('text-', 'bg-').split(' ')[0]}`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 코멘트 입력 */}
              <div className="mb-6">
                <p className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                  코멘트 <span className="font-normal text-slate-400">(선택 · 최대 200자)</span>
                </p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value.slice(0, 200))}
                  placeholder="오늘 어떠셨나요? 짧게 남겨보세요 ✍️"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                />
                <p className="mt-1 text-right text-[9px] font-bold text-slate-300 dark:text-slate-600">
                  {comment.length} / 200
                </p>
              </div>

              {/* 버튼 영역 */}
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-lg transition-all active:scale-[0.98]"
                style={{ backgroundColor: habitColor }}
              >
                <Check className="h-4 w-4 stroke-[3]" />
                기록하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
