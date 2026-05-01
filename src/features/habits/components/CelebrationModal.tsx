'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Zap, Star } from 'lucide-react'

interface CelebrationModalProps {
  open: boolean
  onClose: () => void
  completedCount: number
  totalXP: number
  xpGained: number
}

function MonsterSVG() {
  return (
    <svg viewBox="0 0 100 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* 그림자 */}
      <ellipse cx="50" cy="88" rx="26" ry="4" fill="#000" opacity="0.07" />
      {/* 귀 */}
      <circle cx="22" cy="33" r="10" fill="#4ade80" />
      <circle cx="78" cy="33" r="10" fill="#4ade80" />
      <circle cx="22" cy="33" r="5" fill="#86efac" />
      <circle cx="78" cy="33" r="5" fill="#86efac" />
      {/* 안테나 */}
      <line x1="50" y1="27" x2="50" y2="10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="7" r="6" fill="#fbbf24" />
      <circle cx="50" cy="7" r="3" fill="#f59e0b" />
      {/* 몸통 */}
      <ellipse cx="50" cy="59" rx="36" ry="32" fill="#4ade80" />
      {/* 눈 흰자 */}
      <circle cx="36" cy="52" r="12" fill="white" />
      <circle cx="64" cy="52" r="12" fill="white" />
      {/* 눈동자 */}
      <circle cx="38" cy="53" r="7" fill="#1e293b" />
      <circle cx="66" cy="53" r="7" fill="#1e293b" />
      {/* 눈 하이라이트 */}
      <circle cx="40.5" cy="50" r="3" fill="white" />
      <circle cx="68.5" cy="50" r="3" fill="white" />
      {/* 볼터치 */}
      <circle cx="24" cy="65" r="7" fill="#fda4af" opacity="0.45" />
      <circle cx="76" cy="65" r="7" fill="#fda4af" opacity="0.45" />
      {/* 입 */}
      <path d="M 32 70 Q 50 85 68 70" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* 이빨 */}
      <rect x="41" y="69" width="8" height="8" rx="2" fill="white" />
      <rect x="51" y="69" width="8" height="8" rx="2" fill="white" />
      {/* 팔 (올라감) */}
      <path d="M 16 63 Q 9 46 24 40" stroke="#4ade80" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="23" cy="37" r="6" fill="#4ade80" />
      <path d="M 84 63 Q 91 46 76 40" stroke="#4ade80" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="77" cy="37" r="6" fill="#4ade80" />
    </svg>
  )
}

function XPBar({ totalXP, xpGained }: { totalXP: number; xpGained: number }) {
  const XP_PER_LEVEL = 100
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const currentXP = totalXP % XP_PER_LEVEL
  const prevXP = Math.max(0, currentXP - xpGained) % XP_PER_LEVEL
  const pct = (currentXP / XP_PER_LEVEL) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Lv. {level}</span>
        </div>
        <span className="text-xs font-bold text-slate-400">{currentXP} / {XP_PER_LEVEL} XP</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        {/* 이전 XP */}
        <div className="absolute left-0 top-0 h-full rounded-full bg-green-200" style={{ width: `${prevXP}%` }} />
        {/* 획득한 XP 애니메이션 */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
          initial={{ width: `${prevXP}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
        />
        {/* 반짝임 */}
        <motion.div
          className="absolute top-0 h-full w-6 bg-white/40 skew-x-[-20deg]"
          initial={{ left: '-10%' }}
          animate={{ left: '110%' }}
          transition={{ duration: 0.8, delay: 1.8 }}
        />
      </div>
    </div>
  )
}

export function CelebrationModal({ open, onClose, completedCount, totalXP, xpGained }: CelebrationModalProps) {
  useEffect(() => {
    if (!open) return
    const fire = () => {
      confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#4ade80', '#fbbf24', '#f472b6'] })
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#60a5fa', '#a78bfa', '#34d399'] })
    }
    fire()
    const t = setTimeout(fire, 400)
    return () => clearTimeout(t)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 배경 블러 */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          {/* 모달 카드 */}
          <motion.div
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1,   y: 0,  opacity: 1 }}
            exit={{   scale: 0.7, y: 40,  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-green-200/40 dark:shadow-none border border-green-100 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* 몬스터 애니메이션 */}
            <div className="flex justify-center mb-4">
              <motion.div
                className="h-36 w-36"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MonsterSVG />
              </motion.div>
            </div>

            {/* 텍스트 */}
            <div className="text-center mb-6">
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                완전 대박이에요! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                오늘의 습관 <span className="font-black text-green-500">{completedCount}개</span>를 모두 완료했어요!<br />
                매일이 쌓여 위대해집니다 🌱
              </motion.p>
            </div>

            {/* XP 획득 뱃지 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex justify-center mb-5"
            >
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-2 shadow-lg shadow-orange-200/50">
                <Zap className="h-4 w-4 text-white fill-white" />
                <span className="text-sm font-black text-white">+{xpGained} XP 획득!</span>
              </div>
            </motion.div>

            {/* XP 바 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <XPBar totalXP={totalXP} xpGained={xpGained} />
            </motion.div>

            {/* 확인 버튼 */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-slate-900 dark:bg-white py-3.5 text-sm font-black text-white dark:text-slate-900 hover:bg-green-600 dark:hover:bg-green-400 transition-colors active:scale-[0.98]"
            >
              계속 열심히! 💪
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
