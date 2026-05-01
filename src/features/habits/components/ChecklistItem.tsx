'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleHabitLog } from '../actions'
import { CompletionNoteModal } from './CompletionNoteModal'
import confetti from 'canvas-confetti'
import { Check, RotateCcw, Clock } from 'lucide-react'
import { playDingSound } from '@/lib/audio'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { HabitMood } from '@/types/database'

interface ChecklistItemProps {
  habit: { id: string; title: string; frequency: string; color?: string }
  isCompleted: boolean
  completedAt?: string
  mood?: HabitMood | null
  comment?: string | null
  date: string
  onToggle?: (id: string, completed: boolean, completedAt?: string, mood?: HabitMood | null, comment?: string | null) => void
}

export function ChecklistItem({ habit, isCompleted, completedAt: initialCompletedAt, mood: initialMood, comment: initialComment, date, onToggle }: ChecklistItemProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(isCompleted)
  const [completedAt, setCompletedAt] = useState<string | undefined>(initialCompletedAt)
  const [currentMood, setCurrentMood] = useState<HabitMood | null | undefined>(initialMood)
  const [currentComment, setCurrentComment] = useState<string | null | undefined>(initialComment)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  // 실제 완료 처리 (모달 확인 or 건너뛰기 후 호출)
  const doComplete = (e: { clientX: number; clientY: number }, mood: HabitMood | null, comment: string) => {
    const nowIso = new Date().toISOString()
    setOptimisticCompleted(true)
    setCompletedAt(nowIso)
    setCurrentMood(mood)
    setCurrentComment(comment || null)
    onToggle?.(habit.id, true, nowIso, mood, comment || null)

    playDingSound()
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: [habit.color || '#4ade80', '#fbbf24', '#f472b6', '#60a5fa'],
      shapes: ['circle', 'square'],
      scalar: 1.2,
      gravity: 0.8,
      ticks: 200,
    })

    const prevCompleted = false
    const prevCompletedAt = completedAt
    startTransition(async () => {
      const result = await toggleHabitLog(habit.id, date, prevCompleted, mood, comment || null)
      if (result.error) {
        setOptimisticCompleted(false)
        setCompletedAt(prevCompletedAt)
        onToggle?.(habit.id, false, prevCompletedAt)
      }
    })
  }

  // 취소 처리
  const doCancel = (e: React.MouseEvent) => {
    const prevCompleted = true
    const prevCompletedAt = completedAt
    setOptimisticCompleted(false)
    setCompletedAt(undefined)
    setCurrentMood(null)
    setCurrentComment(null)
    onToggle?.(habit.id, false, undefined)

    startTransition(async () => {
      const result = await toggleHabitLog(habit.id, date, prevCompleted)
      if (result.error) {
        setOptimisticCompleted(true)
        setCompletedAt(prevCompletedAt)
        onToggle?.(habit.id, true, prevCompletedAt)
      }
    })
  }

  // "오늘 완료하기" 클릭 → 모달 열기
  const handleCompleteClick = () => setShowNoteModal(true)

  const done = optimisticCompleted
  const timeStr = completedAt
    ? format(new Date(completedAt), 'a h:mm', { locale: ko })
    : null

  return (
    <>
    <CompletionNoteModal
      open={showNoteModal}
      habitTitle={habit.title}
      habitColor={habit.color}
      onConfirm={(mood, comment) => {
        setShowNoteModal(false)
        // window 접근을 콜백 내부(클라이언트 전용)로 이동 — SSR에서 window 없음 방지
        const center = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }
        doComplete(center, mood, comment)
      }}
      onClose={() => setShowNoteModal(false)}
    />
    <motion.div
      layout
      layoutId={habit.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: 'spring', stiffness: 320, damping: 32 } }}
      className={`relative overflow-hidden rounded-[2.5rem] transition-all group/card border ${
        done
          ? 'opacity-60 grayscale-[0.5] dark:bg-slate-900/50'
          : 'bg-white shadow-sm dark:bg-slate-900'
      }`}
      style={{ 
        background: done 
          ? undefined 
          : `linear-gradient(145deg, ${habit.color}08, ${habit.color}15)`,
        borderColor: done ? undefined : habit.color + '25',
        boxShadow: done ? 'none' : `0 10px 30px -10px ${habit.color}20`
      } as any}
    >
      {/* 왼쪽 액센트 바 */}
      <div
        className="absolute left-0 inset-y-0 w-1 rounded-l-2xl transition-colors"
        style={{ backgroundColor: done ? (habit.color || '#4ade80') + '80' : (habit.color || '#10b981') }}
      />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* 뱃지 행 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {/* 완료/미완료 상태 뱃지 */}
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              done
                ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {done ? '완료' : '미완료'}
            </span>
            {/* 반복 주기 뱃지 */}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              habit.frequency === 'daily'
                ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900'
                : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900'
            }`}>
              {habit.frequency === 'daily' ? '매일 반복' : '주간 반복'}
            </span>
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-end gap-0.5"
              >
                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3 stroke-[3]" />
                  완료!
                </span>
                {timeStr && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    <Clock className="h-2.5 w-2.5" />
                    {timeStr}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 습관 이름 */}
        <h4 className={`text-base font-black tracking-tight leading-snug mb-4 transition-all line-clamp-2 ${
          done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
        }`}>
          {habit.title}
        </h4>

        {/* 완료 시 코멘트/만족도 표시 */}
        {done && (currentMood || currentComment) && (
          <div className="mb-3 rounded-xl bg-white/60 dark:bg-slate-700/30 border border-green-100/60 dark:border-green-900/30 px-3 py-2.5 space-y-1">
            {currentMood && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{currentMood === '만족' ? '😊' : currentMood === '보통' ? '😐' : '😞'}</span>
                <span className={`text-[10px] font-black ${
                  currentMood === '만족' ? 'text-green-500' : currentMood === '보통' ? 'text-yellow-500' : 'text-red-400'
                }`}>{currentMood}</span>
              </div>
            )}
            {currentComment && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 italic">
                &quot;{currentComment}&quot;
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        {done ? (
          // 완료 상태: 취소 버튼 (항상 보임)
          <button
            onClick={doCancel}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs border-2 border-dashed border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 bg-transparent hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:border-red-800 dark:hover:text-red-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            완료 취소하기
          </button>
        ) : (
          // 미완료 상태: 체크박스 스타일
          <button
            onClick={handleCompleteClick}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 bg-transparent transition-all active:scale-[0.98] disabled:opacity-60 group/btn"
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-slate-300 dark:border-slate-600 group-hover/btn:border-green-400 transition-colors">
              <Check className="h-3 w-3 text-transparent group-hover/btn:text-green-400 transition-colors stroke-[3]" />
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 group-hover/btn:text-green-500 transition-colors">
              완료
            </span>
          </button>
        )}
      </div>
    </motion.div>
    </>
  )
}
