'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar, type Section } from '@/features/navigation/components/Sidebar'
import { BottomNav } from '@/features/navigation/components/BottomNav'
import { ChecklistSection } from '@/features/habits/components/ChecklistSection'
import { HabitManageSection } from '@/features/habits/components/HabitManageSection'
import { HabitStats } from '@/features/habits/components/HabitStats'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { ThemeToggle } from '@/features/navigation/components/ThemeToggle'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import type { Habit, HabitMood } from '@/types/database'

interface DashboardShellProps {
  habits?: Habit[]
  completedHabitIds?: string[]
  completedTimesMap?: Record<string, string>
  completedNotesMap?: Record<string, { mood: HabitMood | null; comment: string | null }>
  allLogs?: any[]
  localDate?: string
  userEmail?: string
  avatarUrl?: string
  isAdmin?: boolean
  initialSection?: Section
  children?: React.ReactNode
}

const SECTION_TITLES: Record<Section, string> = {
  home:   '🏠 오늘의 습관',
  manage: '📋 나의 습관관리',
  add:    '➕ 습관 추가하기',
  stats:  '📊 습관 통계',
  settings: '⚙️ 설정',
  admin:  '🛡️ 관리자 대시보드',
}

const contentVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.18 } },
}

export function DashboardShell({
  habits,
  completedHabitIds,
  completedTimesMap,
  completedNotesMap,
  allLogs,
  localDate,
  userEmail,
  avatarUrl,
  isAdmin,
  initialSection = 'home',
  children,
}: DashboardShellProps) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSectionChange = (section: Section) => {
    if (section === 'admin' && pathname !== '/admin') {
      router.push('/admin')
      return
    }
    if (section !== 'admin' && pathname === '/admin') {
      router.push('/dashboard')
      // 쿼리 스트링 등으로 섹션을 넘길 수 있지만, 일단 대시보드 홈으로 보냄
      return
    }
    setActiveSection(section)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 md:flex-row">
      {/* 모바일 상단 헤더 */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌻</span>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">HabbitMaker</h1>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* 사이드바 */}
      <Sidebar
        activeSection={activeSection}
        onSelect={handleSectionChange}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        isAdmin={isAdmin}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 하단 네비게이션 (모바일 전용) */}
      <BottomNav 
        activeSection={activeSection} 
        onSelect={handleSectionChange} 
        isAdmin={isAdmin} 
      />

      {/* 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className={`mx-auto p-4 md:p-8 transition-all duration-500 ${
          (activeSection === 'manage' || activeSection === 'stats' || activeSection === 'settings' || activeSection === 'admin') ? 'max-w-6xl' : 'max-w-2xl'
        }`}>
          {/* 섹션 타이틀 */}
          <motion.h2
            key={activeSection + '-title'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100"
          >
            {SECTION_TITLES[activeSection]}
          </motion.h2>

          {/* 섹션 콘텐츠 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={children ? 'children' : activeSection}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children ? (
                children
              ) : (
                <>
                  {activeSection === 'home' && (
                    <ChecklistSection
                      habits={habits || []}
                      completedHabitIds={completedHabitIds || []}
                      completedTimesMap={completedTimesMap || {}}
                      completedNotesMap={completedNotesMap || {}}
                      allLogs={allLogs || []}
                      localDate={localDate || ''}
                    />
                  )}

                  {(activeSection === 'manage' || activeSection === 'add') && (
                    <HabitManageSection 
                      habits={habits || []} 
                      logs={allLogs || []} 
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                    />
                  )}

                  {activeSection === 'stats' && (
                    <HabitStats
                      habits={habits || []}
                      completedHabitIds={completedHabitIds || []}
                      allLogs={allLogs || []}
                    />
                  )}

                  {activeSection === 'settings' && (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">계정 설정</h3>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <Image 
                                src={avatarUrl} 
                                alt="프로필" 
                                width={48} 
                                height={48} 
                                className="h-12 w-12 rounded-full object-cover" 
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl dark:bg-green-900/50">
                                👤
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{userEmail ?? '대표님'}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">로그인됨</p>
                            </div>
                          </div>
                          <LogoutButton />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">앱 설정</h3>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">테마 설정</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">다크 모드 및 라이트 모드 전환</p>
                          </div>
                          <ThemeToggle />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-100 p-6 text-center dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">HabbitMaker v1.0.0</p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">© 2026 Connect AI LAB. All rights reserved.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
