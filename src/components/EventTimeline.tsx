import { motion } from 'framer-motion'
import type { Phase } from '@/data/events'

interface TimelineEvent {
  month: number
  text: string
  phase: Phase
}

interface Props {
  events: TimelineEvent[]
  totalMonths: number
}

const PHASE_CONFIG: Record<Phase, { emoji: string; color: string; label: string; bg: string }> = {
  honeymoon: { emoji: '🌸', color: '#f0a5c0', label: '蜜月期', bg: 'rgba(240, 165, 192, 0.08)' },
  reality:   { emoji: '⚡', color: '#ffa94d', label: '現實期', bg: 'rgba(255, 169, 77, 0.08)' },
  adaptation:{ emoji: '🌿', color: '#6bcb77', label: '適應期', bg: 'rgba(107, 203, 119, 0.08)' },
  finale:    { emoji: '🔚', color: '#ff6b6b', label: '結局',   bg: 'rgba(255, 107, 107, 0.08)' },
}

export default function EventTimeline({ events }: Props) {
  if (events.length === 0) return null

  // Group consecutive events by phase for section headers
  let lastPhase: Phase | null = null

  return (
    <div className="space-y-0">
      <p className="text-xs font-medium text-foreground/80 mb-3 text-center">躺平大事記</p>
      <div className="relative pl-8">
        {/* Vertical line — gradient */}
        <div
          className="absolute left-[11px] top-1 bottom-1 w-px"
          style={{
            background: 'linear-gradient(to bottom, #f0a5c0, #ffa94d, #6bcb77, #ff6b6b)',
          }}
        />

        {events.map((event, i) => {
          const config = PHASE_CONFIG[event.phase]
          const showPhaseHeader = event.phase !== lastPhase
          lastPhase = event.phase

          const monthLabel =
            event.month < 12
              ? `第 ${event.month + 1} 個月`
              : `第 ${Math.floor(event.month / 12)} 年${event.month % 12 > 0 ? ` ${event.month % 12} 個月` : ''}`

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.12 }}
              className="relative pb-3.5 last:pb-0"
            >
              {/* Phase header */}
              {showPhaseHeader && (
                <div
                  className="mb-2 -ml-8 pl-8 py-1 rounded-r-md text-[10px] font-medium flex items-center gap-1"
                  style={{ color: config.color, background: config.bg }}
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </div>
              )}

              {/* Dot — phase colored */}
              <div
                className="absolute left-[-22px] top-[6px] w-[10px] h-[10px] rounded-full border-2 border-background"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 6px ${config.color}66`,
                }}
              />

              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                {monthLabel}
              </p>
              <p className="text-sm leading-snug">{event.text}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
