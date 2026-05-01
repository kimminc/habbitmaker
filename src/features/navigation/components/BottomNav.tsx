'use client'

import { motion } from 'framer-motion'
import { Home, LayoutList, BarChart3, Settings, ShieldAlert } from 'lucide-react'
import { type Section } from './Sidebar'

interface BottomNavProps {
  activeSection: Section
  onSelect: (section: Section) => void
  isAdmin?: boolean
}

const NAV_ITEMS: { id: Section; icon: any; label: string }[] = [
  { id: 'home', icon: Home, label: '홈' },
  { id: 'manage', icon: LayoutList, label: '관리' },
  { id: 'stats', icon: BarChart3, label: '통계' },
  { id: 'settings', icon: Settings, label: '설정' },
  { id: 'admin', icon: ShieldAlert, label: '관리자' },
]

export function BottomNav({ activeSection, onSelect, isAdmin }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-100 bg-white/80 pb-safe pt-2 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80 md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="relative flex flex-col items-center justify-center px-6 py-4 transition-colors"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                isActive
                  ? 'bg-green-50 text-green-600 shadow-sm dark:bg-green-900/30 dark:text-green-400'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute bottom-1 h-1 w-6 rounded-full bg-green-500"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
