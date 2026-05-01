'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? '라이트 모드' : '다크 모드'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
