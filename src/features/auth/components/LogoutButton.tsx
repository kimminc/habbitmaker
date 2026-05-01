'use client'

import { useTransition } from 'react'
import { signOut } from '../actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await signOut() })}
      disabled={isPending}
      className="text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-60 dark:text-gray-400 dark:hover:text-gray-200"
    >
      {isPending ? '...' : '로그아웃'}
    </button>
  )
}
