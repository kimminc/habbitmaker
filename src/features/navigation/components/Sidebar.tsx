'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { ThemeToggle } from './ThemeToggle'

export type Section = 'home' | 'manage' | 'add' | 'delete' | 'stats'

const MENU_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: 'home',   icon: '🏠', label: 'HOME'        },
  { id: 'manage', icon: '📋', label: '나의 습관관리' },
  { id: 'add',    icon: '➕', label: '습관 추가하기' },
  { id: 'delete', icon: '🗑️', label: '습관 삭제하기' },
  { id: 'stats',  icon: '📊', label: '습관 통계'    },
]

interface SidebarProps {
  activeSection: Section
  onSelect: (section: Section) => void
  userEmail?: string
  avatarUrl?: string
}

export function Sidebar({ activeSection, onSelect, userEmail, avatarUrl }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0,    opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      {/* 로고 + 테마 토글 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌻</span>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100">HabbitMaker</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">습관을 게임으로</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 space-y-1 p-4">
        {MENU_ITEMS.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0,   opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeSection === item.id
                ? 'bg-green-50 text-green-700 shadow-sm dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {activeSection === item.id && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto h-2 w-2 rounded-full bg-green-500"
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* 유저 정보 + 로그아웃 */}
      <div className="border-t border-gray-100 p-4 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="프로필" 
              width={32} 
              height={32} 
              className="h-8 w-8 rounded-full object-cover" 
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm dark:bg-green-900/50">
              👤
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail ?? '대표님'}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </motion.aside>
  )
}
