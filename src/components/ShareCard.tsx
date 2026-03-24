import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import type { SimulationResult } from '@/utils/simulator'
import type { TangpingPersonality } from '@/data/personality'

interface Props {
  result: SimulationResult
  personality: TangpingPersonality
  percentile: number
  cityName: string
  onClose: () => void
}

export default function ShareCard({
  result,
  personality,
  percentile,
  cityName,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'generating' | 'done' | 'error'>('generating')

  const years = Math.floor(result.totalYears)
  const months = result.totalMonths % 12

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a1a1f',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          // Override oklch CSS custom properties with hex equivalents
          // html2canvas cannot parse oklch() color functions
          const root = doc.documentElement
          const hexOverrides: Record<string, string> = {
            '--background': '#101820',
            '--foreground': '#e8eaee',
            '--card': 'rgba(22,28,38,0.6)',
            '--card-foreground': '#e8eaee',
            '--popover': '#1a2230',
            '--popover-foreground': '#e8eaee',
            '--primary': '#34b8a8',
            '--primary-foreground': '#0e1e1c',
            '--secondary': '#252c36',
            '--secondary-foreground': '#cdd0d5',
            '--muted': '#252c36',
            '--muted-foreground': '#8a8f96',
            '--accent': '#d4a747',
            '--accent-foreground': '#2a1f0f',
            '--destructive': '#d44030',
            '--border': '#2f3641',
            '--input': '#252c36',
            '--ring': '#34b8a8',
            '--chart-1': '#34b8a8',
            '--chart-2': '#d4a747',
            '--chart-3': '#3daa6a',
            '--chart-4': '#d44030',
            '--chart-5': '#b050d0',
            '--sidebar': '#161e28',
            '--sidebar-foreground': '#e8eaee',
            '--sidebar-primary': '#34b8a8',
            '--sidebar-primary-foreground': '#fafafa',
            '--sidebar-accent': '#252c36',
            '--sidebar-accent-foreground': '#e8eaee',
            '--sidebar-border': '#2f3641',
            '--sidebar-ring': '#34b8a8',
          }
          for (const [prop, val] of Object.entries(hexOverrides)) {
            root.style.setProperty(prop, val)
          }

          const el = doc.querySelector('[data-share-card]') as HTMLElement
          if (el) el.style.background = 'linear-gradient(160deg, #0a1a1f 0%, #0d2428 30%, #111820 60%, #0a1215 100%)'
          const gradientText = doc.querySelector('[data-gradient-text]') as HTMLElement
          if (gradientText) {
            gradientText.style.background = 'none'
            gradientText.style.webkitBackgroundClip = 'unset'
            gradientText.style.webkitTextFillColor = personality.gradient[0]
            gradientText.style.color = personality.gradient[0]
          }
        },
      })

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )

      if (!blob) {
        setStatus('error')
        return
      }

      // Mobile: native share. Desktop: download.
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      if (isMobile && navigator.share && navigator.canShare?.({ files: [new File([], '')] })) {
        try {
          const file = new File([blob], 'tangping-result.png', { type: 'image/png' })
          await navigator.share({ files: [file], title: '躺平模擬器' })
        } catch {
          downloadBlob(blob)
        }
      } else {
        downloadBlob(blob)
      }

      setStatus('done')
    } catch (err) {
      console.error('ShareCard save failed:', err)
      setStatus('error')
    }
  }, [personality, onClose])

  // Auto-trigger on mount — wait for DOM paint + fonts before capture
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate()
    }, 300)
    return () => clearTimeout(timer)
  }, [handleGenerate])

  return (
    <>
      {/* Overlay with status message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="分享卡片"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={status !== 'generating' ? onClose : undefined}
      >
        <div className="text-center">
          {status === 'generating' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">產生分享圖片中...</p>
            </div>
          )}
          {status === 'done' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-3xl">✓</span>
              <p className="text-foreground text-sm font-medium">圖片已儲存！</p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-full text-sm text-muted-foreground border border-border hover:text-foreground transition-colors"
              >
                關閉
              </button>
            </motion.div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-destructive text-sm">產生圖片失敗</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStatus('generating'); setTimeout(handleGenerate, 300) }}
                  className="text-foreground text-xs underline"
                >
                  重試
                </button>
                <button
                  onClick={onClose}
                  className="text-muted-foreground text-xs underline"
                >
                  關閉
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Card rendered invisibly for html2canvas capture (must be in viewport for rendering) */}
      <div style={{ position: 'fixed', left: 0, top: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div
          ref={cardRef}
          data-share-card
          style={{
            width: 360,
            height: 640,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #0a1a1f 0%, #0d2428 30%, #111820 60%, #0a1215 100%)',
            border: `1px solid ${personality.gradient[0]}30`,
          }}
        >
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '36px 28px',
              boxSizing: 'border-box',
            }}
          >
            {/* Top */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#8a9a9e', letterSpacing: 3, margin: 0 }}>
                躺 平 模 擬 器
              </p>
            </div>

            {/* Middle */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: 56 }}>{personality.emoji}</div>
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: personality.color, lineHeight: 1.2, margin: 0 }}>
                  {personality.name}
                </p>
                <p style={{ fontSize: 13, color: '#8a9a9e', marginTop: 6, marginBottom: 0 }}>
                  {personality.title}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 20px', marginTop: 20 }}>
                <p style={{ fontSize: 12, color: '#8a9a9e', marginBottom: 6, marginTop: 0 }}>
                  在{cityName}可以躺
                </p>
                <p
                  data-gradient-text
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    background: `linear-gradient(90deg, ${personality.gradient[0]}, ${personality.gradient[1]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {years > 0 ? `${years}年` : ''}{months}個月
                </p>
                <p style={{ fontSize: 12, color: '#7a8a8e', marginTop: 4, marginBottom: 0 }}>
                  約 {result.totalDays.toLocaleString('zh-TW')} 天
                </p>
              </div>

              <div style={{ padding: '0 12px', marginTop: 20 }}>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentile}%`, height: '100%', borderRadius: 3,
                    background: `linear-gradient(90deg, ${personality.gradient[0]}, ${personality.gradient[1]})`,
                  }} />
                </div>
                <p style={{ fontSize: 12, color: '#8a9a9e', marginTop: 6, marginBottom: 0 }}>
                  勝過 <strong style={{ color: personality.color }}>{percentile}%</strong> 的人
                </p>
              </div>

              <p style={{ fontSize: 14, color: '#a8b8bc', fontStyle: 'italic', lineHeight: 1.5, padding: '0 8px', marginTop: 20, marginBottom: 0 }}>
                「{personality.oneliner}」
              </p>
            </div>

            {/* Bottom */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: 13, color: '#8a9a9e', margin: 0 }}>你也來躺平 →</p>
              <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px auto' }} />
              <p style={{ fontSize: 12, color: '#7a8a8e', letterSpacing: 1, margin: 0 }}>tangping.zeabur.app</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tangping-result.png'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
