import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { MonthSnapshot } from '@/utils/simulator'

interface Props {
  timeline: MonthSnapshot[]
  className?: string
}

export default function BalanceChart({ timeline, className = '' }: Props) {
  const { points, maxBalance, totalMonths } = useMemo(() => {
    if (timeline.length === 0) return { points: [], maxBalance: 0, totalMonths: 0 }

    const max = Math.max(...timeline.map((s) => s.balance)) || 1
    const total = Math.max(1, timeline.length - 1)

    const step = Math.max(1, Math.floor(total / 80))
    const sampled = timeline.filter((_, i) => i % step === 0 || i === total)

    const pts = sampled.map((s) => {
      const x = (s.month / total) * 100
      const y = 100 - (s.balance / max) * 100
      return `${x},${y}`
    })

    return { points: pts, maxBalance: max, totalMonths: total }
  }, [timeline])

  if (points.length === 0) return null

  const polylinePoints = points.join(' ')
  const areaPoints = `0,100 ${polylinePoints} 100,100`

  const yearMarkers = useMemo(() => {
    const markers = []
    const maxYears = Math.min(10, Math.ceil(totalMonths / 12))
    for (let y = 1; y <= maxYears; y++) {
      if (y * 12 <= totalMonths) {
        markers.push({ x: (y * 12 / totalMonths) * 100, label: `${y}年` })
      }
    }
    return markers
  }, [totalMonths])

  // Find midpoint for annotation
  const halfMonthX = totalMonths > 0 ? (Math.floor(totalMonths / 2) / totalMonths) * 100 : 50
  const halfBalance = timeline[Math.floor(timeline.length / 2)]?.balance ?? 0
  const halfBalanceLabel = `NT$ ${Math.round(halfBalance).toLocaleString('zh-TW')}`

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-2">
        <p className="text-xs font-medium text-foreground/80">存款餘額變化</p>
        <span className="text-[10px] text-muted-foreground">NT$ {maxBalance.toLocaleString('zh-TW')}</span>
      </div>

      <div className="relative rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-36 md:h-44 block"
        >
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />

          {yearMarkers.map((m) => (
            <line key={m.x} x1={m.x} y1="0" x2={m.x} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" strokeDasharray="2,2" />
          ))}

          <polygon points={areaPoints} fill="url(#areaGrad)" />

          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 1.5, ease: 'easeInOut' }}
            points={polylinePoints}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 3px rgba(107, 203, 119, 0.4))' }}
          />

          {/* Midpoint marker */}
          <circle cx={halfMonthX} cy={100 - (halfBalance / (maxBalance || 1)) * 100} r="1.2" fill="#ffd93d" opacity="0.8" />

          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4db8a4" />
              <stop offset="40%" stopColor="#6bcb77" />
              <stop offset="70%" stopColor="#ffd93d" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4db8a4" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#6bcb77" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span className="text-primary/70">開始</span>
        <div className="flex gap-3">
          {yearMarkers.slice(0, 6).map((m) => (
            <span key={m.x}>{m.label}</span>
          ))}
        </div>
        <span className="text-destructive/70">歸零</span>
      </div>

      {/* Midpoint annotation */}
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        半程時剩 <span className="text-foreground/70 font-medium">{halfBalanceLabel}</span>
      </p>
    </div>
  )
}
