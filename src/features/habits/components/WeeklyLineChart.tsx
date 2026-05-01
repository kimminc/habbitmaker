'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, subDays, startOfToday, eachDayOfInterval, isSameDay
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { BarChart3, LineChart, LayoutGrid, Calendar, TrendingUp, Flame, Target, PieChart, Activity, BarChart2, Crosshair } from 'lucide-react'
import type { Habit } from '@/types/database'

type ViewRange = 'daily' | 'weekly' | 'monthly'
type ChartType = 'line' | 'bar' | 'heatmap' | 'pie' | 'linehist' | 'vbar' | 'scatter'

interface WeeklyLineChartProps {
  logs: any[]
  habits: Habit[]
  activeHabitsCount: number
}

const HABIT_COLORS = [
  '#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#8b5cf6',
  '#2dd4bf', '#f87171', '#38bdf8', '#fb923c', '#a78bfa',
]

// Smooth cubic bezier path through points
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`
  }
  return d
}

export function WeeklyLineChart({ logs, habits, activeHabitsCount }: WeeklyLineChartProps) {
  const [viewRange, setViewRange] = useState<ViewRange>('weekly')
  const [chartType, setChartType] = useState<ChartType>('line')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const today = startOfToday()
  const todayStr = format(today, 'yyyy-MM-dd')

  // Summary stats
  const todayCount = logs.filter(l => l.log_date === todayStr).length
  const todayRate = activeHabitsCount > 0 ? Math.round((todayCount / activeHabitsCount) * 100) : 0

  const streak = useMemo(() => {
    let s = 0
    for (let i = 0; i < 60; i++) {
      const ds = format(subDays(today, i), 'yyyy-MM-dd')
      if (logs.some(l => l.log_date === ds)) s++
      else if (i > 0) break
    }
    return s
  }, [logs, today])

  const totalLogs = useMemo(() => logs.length, [logs])

  // Chart data
  const chartData = useMemo(() => {
    if (viewRange === 'daily') {
      return habits.map((habit, i) => ({
        label: habit.title,
        value: logs.some(l => l.habit_id === habit.id && l.log_date === todayStr) ? 1 : 0,
        color: HABIT_COLORS[i % HABIT_COLORS.length],
      }))
    }
    const days = viewRange === 'weekly' ? 6 : 29
    return eachDayOfInterval({ start: subDays(today, days), end: today }).map(date => {
      const ds = format(date, 'yyyy-MM-dd')
      return {
        date,
        label: viewRange === 'weekly' ? format(date, 'EEE', { locale: ko }) : format(date, 'd'),
        value: logs.filter(l => l.log_date === ds).length,
        isToday: isSameDay(date, today),
      }
    })
  }, [viewRange, logs, habits, today, todayStr])

  // SVG dimensions
  const W = 400, H = 160
  const PX = 40, PY = 28
  const CW = W - PX * 2
  const CH = H - PY * 2

  // Y값 계산 헬퍼 (daily는 0/1, 나머지는 비율)
  const yRatio = useCallback((d: any) =>
    viewRange === 'daily' ? d.value : (activeHabitsCount > 0 ? d.value / activeHabitsCount : 0)
  , [viewRange, activeHabitsCount])

  const linePoints = useMemo(() => {
    if (chartType !== 'line' || chartData.length < 2) return []
    return chartData.map((d: any, i) => ({
      x: PX + i * (CW / (chartData.length - 1)),
      y: H - PY - yRatio(d) * CH,
    }))
  }, [chartData, chartType, CW, CH, yRatio])

  // 선 히스토그램 — 각 바의 중앙 상단점
  const histPoints = useMemo(() => {
    if (chartType !== 'linehist' || chartData.length < 2) return []
    const slotW = CW / chartData.length
    return chartData.map((d: any, i) => ({
      x: PX + (i + 0.5) * slotW,
      y: H - PY - Math.max(yRatio(d) * CH, 2),
    }))
  }, [chartData, chartType, CW, CH, yRatio])

  // 도넛 차트 달성률
  const donutPct = useMemo(() => {
    if (chartType !== 'pie') return 0
    if (viewRange === 'daily') {
      return chartData.length > 0
        ? (chartData as any[]).filter(d => d.value === 1).length / chartData.length
        : 0
    }
    const sum = (chartData as any[]).reduce((s, d) => s + d.value, 0)
    const possible = activeHabitsCount * chartData.length
    return possible > 0 ? sum / possible : 0
  }, [chartData, chartType, viewRange, activeHabitsCount])

  const linePath = smoothPath(linePoints)
  const histPath = smoothPath(histPoints)
  const areaPath = linePoints.length > 1
    ? `${linePath} L ${linePoints[linePoints.length - 1].x} ${H - PY} L ${linePoints[0].x} ${H - PY} Z`
    : ''
  const histAreaPath = histPoints.length > 1
    ? `${histPath} L ${histPoints[histPoints.length - 1].x} ${H - PY} L ${histPoints[0].x} ${H - PY} Z`
    : ''

  function handleChartType(t: ChartType) {
    setChartType(t)
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-all duration-500">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
            성취 리포트
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {format(today, 'yyyy.MM.dd')}
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['daily', 'weekly', 'monthly'] as ViewRange[]).map(r => (
            <button
              key={r}
              onClick={() => setViewRange(r)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                viewRange === r
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {r === 'daily' ? '오늘' : r === 'weekly' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-100/50 dark:border-green-900/30">
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-green-500" />
            <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">오늘 달성</p>
          </div>
          <p className="text-2xl font-black text-green-700 dark:text-green-300 leading-none">
            {todayRate}<span className="text-xs font-bold ml-0.5">%</span>
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-3 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-100/50 dark:border-orange-900/30">
          <div className="flex items-center gap-1 mb-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">연속 달성</p>
          </div>
          <p className="text-2xl font-black text-orange-700 dark:text-orange-300 leading-none">
            {streak}<span className="text-xs font-bold ml-0.5">일</span>
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-3 dark:from-violet-950/50 dark:to-purple-950/50 border border-violet-100/50 dark:border-violet-900/30">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-violet-500" />
            <p className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">총 완료</p>
          </div>
          <p className="text-2xl font-black text-violet-700 dark:text-violet-300 leading-none">
            {totalLogs}<span className="text-xs font-bold ml-0.5">회</span>
          </p>
        </div>
      </div>

      {/* Chart type selector */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {([
            { t: 'line'     as ChartType, Icon: LineChart,  label: '라인'   },
            { t: 'bar'      as ChartType, Icon: BarChart3,  label: '바'     },
            { t: 'heatmap'  as ChartType, Icon: LayoutGrid, label: '히트맵' },
            { t: 'pie'      as ChartType, Icon: PieChart,   label: '파이'   },
            { t: 'linehist' as ChartType, Icon: Activity,   label: '선히스' },
            { t: 'vbar'     as ChartType, Icon: BarChart2,  label: '막대'   },
            { t: 'scatter'  as ChartType, Icon: Crosshair,  label: '산포'   },
          ]).map(({ t, Icon, label }) => (
            <button
              key={t}
              onClick={() => handleChartType(t)}
              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                chartType === t
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 dark:bg-green-950/60 dark:text-green-400 px-2.5 py-1.5 rounded-full border border-green-100 dark:border-green-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Main chart area */}
      <div
        className="relative"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }}
      >
        {/* Tooltip — follows mouse cursor */}
        <AnimatePresence>
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            // 위치 전담 div (transform 충돌 방지를 위해 motion.div와 분리)
            <div
              className="absolute z-30 pointer-events-none"
              style={{
                left: mousePos.x,
                top: mousePos.y - 72,
                transform: 'translateX(-50%)',
              }}
            >
              <motion.div
                key={hoveredIndex}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col items-center"
              >
                <div className="min-w-[100px] rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-center shadow-2xl">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                    {(chartData[hoveredIndex] as any).label}
                  </p>
                  <p className="text-base font-black text-white dark:text-slate-900 mt-1">
                    {viewRange === 'daily'
                      ? ((chartData[hoveredIndex] as any).value ? '완료 ✅' : '미완료 ⏳')
                      : `${(chartData[hoveredIndex] as any).value}개 달성`}
                  </p>
                </div>
                {/* 아래 방향 화살표 */}
                <div className="h-2 w-2 rotate-45 bg-slate-900 dark:bg-white -mt-1" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Chart */}
        <div className="h-[160px] w-full mt-10">
          {chartType === 'heatmap' ? (
            <HeatmapView data={logs} habitsCount={habits.length} />
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
                  <stop offset="70%" stopColor="#22c55e" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <g key={tick}>
                  <line
                    x1={PX} y1={H - PY - tick * CH}
                    x2={W - PX} y2={H - PY - tick * CH}
                    stroke={tick === 0 ? '#cbd5e1' : '#f1f5f9'}
                    strokeWidth="1"
                    strokeDasharray={tick > 0 && tick < 1 ? '3 4' : '0'}
                    className={tick === 0 ? 'dark:stroke-slate-600' : 'dark:stroke-slate-800'}
                  />
                  {tick % 0.5 === 0 && (
                    <text
                      x={PX - 5} y={H - PY - tick * CH + 3.5}
                      textAnchor="end" fontSize="8" fontWeight="700" fill="#94a3b8"
                    >
                      {Math.round(tick * 100)}%
                    </text>
                  )}
                </g>
              ))}

              {/* Line chart — daily 포함 모든 범위 */}
              {chartType === 'line' && linePoints.length > 1 && (
                <>
                  <motion.path
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                    d={areaPath} fill="url(#areaGrad)"
                  />
                  {/* Glow line */}
                  <motion.path
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    d={linePath} fill="none"
                    stroke="url(#lineGrad)" strokeWidth="10" strokeLinecap="round"
                    opacity="0.12" filter="url(#glowFilter)"
                  />
                  {/* Main line */}
                  <motion.path
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    d={linePath} fill="none"
                    stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {linePoints.map((p, i) => {
                    const d = chartData[i] as any
                    const isMax = activeHabitsCount > 0 && d.value === activeHabitsCount
                    return (
                      <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                        <rect x={p.x - 18} y={0} width={36} height={H} fill="transparent" className="cursor-pointer" />
                        {/* Hover ring */}
                        <motion.circle
                          animate={{ r: hoveredIndex === i ? 10 : 0, opacity: hoveredIndex === i ? 0.2 : 0 }}
                          cx={p.x} cy={p.y} fill="#22c55e"
                        />
                        {/* Dot */}
                        <motion.circle
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                          cx={p.x} cy={p.y}
                          r={d.isToday ? 5 : 4}
                          fill={d.isToday ? '#22c55e' : 'white'}
                          stroke={isMax ? '#818cf8' : '#22c55e'}
                          strokeWidth="2.5"
                          className="drop-shadow-sm"
                        />
                        {/* Today label */}
                        {d.isToday && (
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="7" fontWeight="900" fill="#22c55e">
                            TODAY
                          </text>
                        )}
                      </g>
                    )
                  })}
                </>
              )}

              {/* Bar chart */}
              {chartType === 'bar' && chartData.map((d: any, i) => {
                const slotW = CW / chartData.length
                const bw = Math.min(slotW * 0.55, 26)
                const x = PX + i * slotW + (slotW - bw) / 2
                const ratio = viewRange === 'daily'
                  ? (d.value ? 1 : 0.05)
                  : (activeHabitsCount > 0 ? d.value / activeHabitsCount : 0)
                const bh = Math.max(ratio * CH, 4)
                const y = H - PY - bh
                const isHighlight = d.isToday || (viewRange === 'daily' && d.value === 1)

                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                    {/* Track */}
                    <rect x={x} y={PY} width={bw} height={CH} rx={bw / 2}
                      fill="#f8fafc" className="dark:fill-slate-800" />
                    {/* Bar */}
                    <motion.rect
                      initial={{ height: 0, y: H - PY }}
                      animate={{ height: bh, y }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 130, damping: 14 }}
                      x={x} width={bw} rx={bw / 2}
                      fill={viewRange === 'daily' ? d.color : (isHighlight ? 'url(#barGrad)' : '#bbf7d0')}
                      className="dark:opacity-90"
                      opacity={hoveredIndex === i ? 1 : 0.82}
                    />
                    {/* Peak dot */}
                    {ratio > 0.05 && (
                      <motion.circle
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: i * 0.04 + 0.3 }}
                        cx={x + bw / 2} cy={y}
                        r="3"
                        fill={isHighlight ? '#16a34a' : '#4ade80'}
                      />
                    )}
                  </g>
                )
              })}

              {/* ── 파이(도넛) 차트 ── */}
              {chartType === 'pie' && (() => {
                const cx = W / 2, cy = H / 2
                const R = 46, sw = 20
                const circ = 2 * Math.PI * R
                const pctVal = Math.min(donutPct, 1)
                const completed = viewRange === 'daily'
                  ? (chartData as any[]).filter(d => d.value === 1).length
                  : Math.round(donutPct * (activeHabitsCount * chartData.length))
                const total = viewRange === 'daily'
                  ? chartData.length
                  : activeHabitsCount * chartData.length
                return (
                  <g>
                    {/* 배경 링 */}
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={sw} className="dark:stroke-slate-800" />
                    {/* 달성 링 */}
                    <motion.circle
                      cx={cx} cy={cy} r={R} fill="none"
                      stroke="url(#lineGrad)" strokeWidth={sw} strokeLinecap="round"
                      strokeDasharray={`${circ} ${circ}`}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ * (1 - pctVal) }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
                    />
                    {/* 중앙 텍스트 */}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b" className="dark:fill-white">
                      {Math.round(pctVal * 100)}%
                    </text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">
                      달성률
                    </text>
                    <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8" fontWeight="600" fill="#cbd5e1">
                      {completed} / {total}
                    </text>
                    {/* 좌우 장식 레이블 */}
                    <text x={PX} y={cy + 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#22c55e">완료</text>
                    <text x={W - PX} y={cy + 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#94a3b8">미달성</text>
                  </g>
                )
              })()}

              {/* ── 선 히스토그램 ── */}
              {chartType === 'linehist' && (
                <>
                  {/* 연한 바 배경 */}
                  {(chartData as any[]).map((d, i) => {
                    const slotW = CW / chartData.length
                    const bw = slotW * 0.85
                    const x = PX + i * slotW + (slotW - bw) / 2
                    const bh = Math.max(yRatio(d) * CH, 2)
                    return (
                      <rect key={i} x={x} y={H - PY - bh} width={bw} height={bh}
                        fill="#22c55e" opacity="0.08" rx="2" />
                    )
                  })}
                  {/* 채움 영역 */}
                  {histAreaPath && (
                    <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} d={histAreaPath} fill="url(#areaGrad)" />
                  )}
                  {/* 빈도 다각형 선 */}
                  {histPath && (
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      d={histPath} fill="none" stroke="#818cf8" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  )}
                  {/* 꼭짓점 점 */}
                  {histPoints.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                      <rect x={p.x - 14} y={0} width={28} height={H} fill="transparent" className="cursor-pointer" />
                      <motion.circle
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                        cx={p.x} cy={p.y} r="4"
                        fill="white" stroke="#818cf8" strokeWidth="2.5" className="drop-shadow-sm"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* ── 세로 막대 히스토그램 ── */}
              {chartType === 'vbar' && (chartData as any[]).map((d, i) => {
                const slotW = CW / chartData.length
                const x = PX + i * slotW
                const bh = Math.max(yRatio(d) * CH, 2)
                const y = H - PY - bh
                const isHighlight = d.isToday || (viewRange === 'daily' && d.value === 1)
                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                    {/* 배경 */}
                    <rect x={x} y={PY} width={slotW} height={CH} fill="#f8fafc" className="dark:fill-slate-800/50" />
                    {/* 막대 */}
                    <motion.rect
                      initial={{ height: 0, y: H - PY }}
                      animate={{ height: bh, y }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 140, damping: 15 }}
                      x={x} width={slotW}
                      fill={viewRange === 'daily' ? d.color : (isHighlight ? 'url(#barGrad)' : '#86efac')}
                      opacity={hoveredIndex === i ? 1 : 0.8}
                    />
                    {/* 경계선 */}
                    <rect x={x} y={PY} width={slotW} height={CH} fill="none" stroke="white" strokeWidth="0.5" className="dark:stroke-slate-900" />
                  </g>
                )
              })}

              {/* ── 산포도 ── */}
              {chartType === 'scatter' && (chartData as any[]).map((d, i) => {
                const x = PX + (chartData.length > 1 ? i * (CW / (chartData.length - 1)) : CW / 2)
                const ratio = yRatio(d)
                const y = H - PY - ratio * CH
                const r = 3 + ratio * 8  // 달성률에 비례한 크기
                const color = ratio > 0.8 ? '#22c55e' : ratio > 0.4 ? '#fbbf24' : ratio > 0 ? '#f87171' : '#e2e8f0'
                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                    {/* 외곽 후광 */}
                    <motion.circle
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.2 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                      cx={x} cy={y} r={r + 5} fill={color}
                    />
                    {/* 메인 점 */}
                    <motion.circle
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 280 }}
                      cx={x} cy={y} r={r}
                      fill={color} stroke="white" strokeWidth="1.5"
                      className="cursor-pointer drop-shadow-sm"
                    />
                    {/* 수직 가이드 선 */}
                    <line x1={x} y1={y + r} x2={x} y2={H - PY}
                      stroke={color} strokeWidth="1" opacity="0.2" strokeDasharray="2 2" />
                  </g>
                )
              })}

            </svg>
          )}
        </div>
      </div>

      {/* X-axis labels */}
      {chartType !== 'heatmap' && chartType !== 'pie' && (
        <div
          className="mt-2 flex overflow-x-auto scrollbar-hide"
          style={{ paddingLeft: PX, paddingRight: PX }}
        >
          {viewRange !== 'monthly' ? (
            chartData.map((d: any, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5 flex-1 min-w-0"
              >
                <span className={`text-[8px] font-black truncate ${d.isToday ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {viewRange === 'daily' ? '·' : d.label}
                </span>
                {d.isToday && <span className="h-1 w-1 rounded-full bg-green-500" />}
              </div>
            ))
          ) : (
            <div className="w-full flex justify-between text-[8px] font-black text-slate-300 dark:text-slate-600">
              <span>30일 전</span>
              <span>오늘</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HeatmapView({ data, habitsCount }: { data: any[]; habitsCount: number }) {
  const today = startOfToday()
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today })

  return (
    <div className="grid grid-cols-10 gap-1.5 h-full items-center px-2">
      {days.map((date, i) => {
        const ds = format(date, 'yyyy-MM-dd')
        const count = data.filter(l => l.log_date === ds).length
        const ratio = habitsCount > 0 ? count / habitsCount : 0
        const isToday = isSameDay(date, today)

        const bg =
          ratio > 0.8 ? 'bg-green-500 dark:bg-green-500' :
          ratio > 0.5 ? 'bg-green-400 dark:bg-green-600' :
          ratio > 0.2 ? 'bg-green-200 dark:bg-green-800' :
          ratio > 0   ? 'bg-green-100 dark:bg-green-900' :
          'bg-slate-100 dark:bg-slate-800'

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.012, type: 'spring', stiffness: 200 }}
            className={`aspect-square rounded-md ${bg} ${isToday ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
            title={`${format(date, 'MM.dd')}: ${count}개`}
          />
        )
      })}
    </div>
  )
}
