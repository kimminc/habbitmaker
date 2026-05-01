import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, BarChart3, Target, Zap, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-green-100 selection:text-green-900">
      {/* 1. 네비게이션 */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌻</span>
            <span className="text-xl font-bold tracking-tight">HabbitMaker</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              로그인
            </Link>
            <Link 
              href="/login" 
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. 히어로 섹션 */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              <Zap className="h-4 w-4" />
              <span>새롭게 태어난 습관 메이커 v1.0</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl">
              지루한 습관 형성을<br />
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">하나의 게임으로</span> 만드세요
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-slate-500 sm:text-xl">
              HabbitMaker는 단순한 체크리스트가 아닙니다. 당신의 성장을 시각화하고,<br className="hidden sm:block" /> 
              매일의 작은 성취를 찬란한 성과로 기록하는 가장 세련된 도구입니다.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link 
                href="/login" 
                className="group flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-green-200 transition-all hover:bg-green-600 hover:scale-105"
              >
                지금 바로 시작하기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-sm text-slate-400">신용카드 필요 없음 · 30초면 가입 완료</p>
            </div>
          </div>

          {/* 메인 비주얼 (생성된 이미지 활용) */}
          <div className="mt-20 flex justify-center">
            <div className="relative rounded-3xl bg-slate-100 p-2 shadow-2xl overflow-hidden group">
              <Image 
                src="/habbitmaker_hero_1777533512433.png" 
                alt="HabbitMaker Dashboard Preview" 
                width={1200}
                height={800}
                priority
                className="max-w-full h-auto rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 특징 섹션 */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">더 이상 포기하지 마세요</h2>
            <p className="mt-4 text-slate-500">당신의 습관이 지속될 수밖에 없는 이유</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">심플한 데일리 체크</h3>
              <p className="text-slate-500 leading-relaxed">복잡한 설정 없이 오늘 해야 할 습관을 터치 한 번으로 완료하세요. 최소한의 노력으로 최대의 만족감을 드립니다.</p>
            </div>
            
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">비주얼 통계 시스템</h3>
              <p className="text-slate-500 leading-relaxed">지난 30일간의 데이터를 아름다운 그래프로 확인하세요. 내가 얼마나 성장했는지 눈으로 보는 즐거움을 선사합니다.</p>
            </div>
            
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">완벽한 모바일 최적화</h3>
              <p className="text-slate-500 leading-relaxed">언제 어디서나 스마트폰으로 쉽고 빠르게 기록하세요. 당신의 주머니 속에서 습관 메이커가 함께합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 마지막 CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-50 rounded-full blur-[120px] opacity-50 -z-10" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">당신의 습관은 이제<br />우리가 책임집니다</h2>
          <p className="mt-6 text-lg text-slate-500">지금 가입하고 2,345명의 사용자와 함께 새로운 삶을 시작해 보세요.</p>
          <div className="mt-10 flex flex-col items-center gap-6">
            <Link 
              href="/login" 
              className="rounded-full bg-slate-900 px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all hover:bg-slate-800 hover:scale-105"
            >
              무료로 계정 만들기
            </Link>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                평생 무료
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                No ADS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 푸터 */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="font-bold">HabbitMaker</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 HabbitMaker. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-900">약관</a>
            <a href="#" className="hover:text-slate-900">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
