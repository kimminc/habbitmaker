'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { ThemeToggle } from './ThemeToggle'

export type Section = 'home' | 'manage' | 'add' | 'delete' | 'stats' | 'settings'

const MENU_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: 'home',   icon: '🏠', label: 'HOME'        },
  { id: 'manage', icon: '📋', label: '관리'        },
  { id: 'stats',  icon: '📊', label: '통계'        },
  { id: 'settings', icon: '⚙️', label: '설정'      },
]

interface SidebarProps {
  activeSection: Section
  onSelect: (section: Section) => void
  userEmail?: string
  avatarUrl?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ activeSection, onSelect, userEmail, avatarUrl, isOpen, onClose }: SidebarProps) {
  const handleSelect = (section: Section) => {
    onSelect(section)
    if (onClose) onClose()
  }

  return (
    <>
      {/* 모바일 오버레이 (사이드바 열렸을 때 배경 어둡게) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -300 : 0),
          opacity: 1 
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 md:relative md:translate-x-0 md:shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={onClose} className="p-1 text-gray-400 md:hidden">✕</button>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 space-y-1 p-4">
          {MENU_ITEMS.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0,   opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              onClick={() => handleSelect(item.id)}
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
              <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{userEmail ?? '대표님'}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </motion.aside>
    </>
  )
}
