import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { MonthSnapshot } from '../utils/simulator'

interface Props {
  timeline: MonthSnapshot[]
  className?: string
}

export default function BalanceChart({ timeline, className = '' }: Props) {
  const { points, maxBalance, totalMonths } = useMemo(() => {
    const max = Math.max(...timeline.map((s) => s.balance))
    const total = timeline.length - 1

    // Reduce data points for smoother rendering
    const step = Math.max(1, Math.floor(total / 100))
    const sampled = timeline.filter((_, i) => i % step === 0 || i === total)

    const pts = sampled.map((s) => {
      const x = (s.month / total) * 100
      const y = 100 - (s.balance / max) * 100
      return `${x},${y}`
    })

    return { points: pts, maxBalance: max, totalMonths: total }
  }, [timeline])

  const polylinePoints = points.join(' ')
  // Create area fill
  const areaPoints = `0,100 ${polylinePoints} 100,100`

  const yearMarkers = useMemo(() => {
    const markers = []
    for (let y = 1; y * 12 < totalMonths; y++) {
      markers.push({
        x: (y * 12 / totalMonths) * 100,
        label: `${y}年`,
      })
    }
    return markers
  }, [totalMonths])

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>NT$ {maxBalance.toLocaleString('zh-TW')}</span>
        <span>存款餘額</span>
      </div>

      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-32 md:h-48"
      >
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#1e1e2e" strokeWidth="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#1e1e2e" strokeWidth="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#1e1e2e" strokeWidth="0.3" />

        {/* Year markers */}
        {yearMarkers.map((m) => (
          <line
            key={m.x}
            x1={m.x}
            y1="0"
            x2={m.x}
            y2="100"
            stroke="#1e1e2e"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
        ))}

        {/* Area fill */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.8, duration: 1 }}
          points={areaPoints}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 2, ease: 'easeInOut' }}
          points={polylinePoints}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6bcb77" />
            <stop offset="50%" stopColor="#ffd93d" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>

      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>開始</span>
        {yearMarkers.slice(0, 5).map((m) => (
          <span key={m.x} style={{ position: 'relative', left: `${m.x - 50}%` }}>
            {m.label}
          </span>
        ))}
        <span>歸零</span>
      </div>
    </div>
  )
}
