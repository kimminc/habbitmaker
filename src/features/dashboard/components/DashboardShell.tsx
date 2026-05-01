'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar, type Section } from '@/features/navigation/components/Sidebar'
import { ChecklistSection } from '@/features/habits/components/ChecklistSection'
import { HabitManageSection } from '@/features/habits/components/HabitManageSection'
import { HabitStats } from '@/features/habits/components/HabitStats'
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
  children?: React.ReactNode
}

const SECTION_TITLES: Record<Section, string> = {
  home:   '🏠 오늘의 습관',
  manage: '📋 나의 습관관리',
  add:    '➕ 습관 추가하기',
  delete: '🗑️ 습관 삭제하기',
  stats:  '📊 습관 통계',
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
  children,
}: DashboardShellProps) {
  const [activeSection, setActiveSection] = useState<Section>('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 md:flex-row">
      {/* 모바일 상단 헤더 */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌻</span>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">HabbitMaker</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* 사이드바 */}
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto p-4 md:p-8 transition-all duration-500 ${
          (activeSection === 'manage' || activeSection === 'stats') ? 'max-w-6xl' : 'max-w-2xl'
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

                  {(activeSection === 'manage' || activeSection === 'add' || activeSection === 'delete') && (
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
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
