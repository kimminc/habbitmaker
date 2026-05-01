'use server'

// Design Ref: §4.1 — Auth Server Actions. Application layer.
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function signInWithGoogle() {
  const supabase = createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=oauth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { data: null, error: error.message }

  // 첫 로그인 시 profile이 없을 수 있으므로 upsert
  if (data.user) {
    await supabase.from('profiles').upsert(
      { id: data.user.id, email: data.user.email ?? email },
      { onConflict: 'id' }
    )
  }

  redirect('/dashboard')
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { data: null, error: error.message }

  // 이메일 인증 없이 바로 세션이 생긴 경우 → 프로필 생성 후 대시보드 이동
  if (data.user && data.session) {
    await supabase.from('profiles').upsert(
      { id: data.user.id, email: data.user.email ?? email },
      { onConflict: 'id' }
    )
    redirect('/dashboard')
  }

  // 이메일 인증이 필요한 경우 (Supabase 기본 설정)
  if (data.user && !data.session) {
    return { data: { needsConfirmation: true }, error: null }
  }

  return { data: null, error: '회원가입에 실패했습니다.' }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
