import { LoginButton } from '@/features/auth/components/LoginButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      {/* 뒤로가기 (홈으로) */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        홈으로 돌아가기
      </Link>

      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="mb-4 text-6xl drop-shadow-sm">🌻</div>
          <h1 className="mb-2 text-3xl font-black text-slate-900 tracking-tight">반가워요!</h1>
          <p className="text-slate-500 font-medium">HabbitMaker와 함께 습관을 게임처럼 즐겨보세요</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-green-100 border border-green-50">
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">간편 로그인</h2>
            <LoginButton />
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            로그인 시 <span className="underline decoration-slate-200 underline-offset-2">이용약관</span> 및 <span className="underline decoration-slate-200 underline-offset-2">개인정보처리방침</span>에<br />동의하는 것으로 간주합니다.
          </p>
        </div>

        <p className="mt-12 text-sm text-slate-300">
          © 2026 HabbitMaker. Crafted with love.
        </p>
      </div>
    </div>
  )
}
