import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import type { SimulationResult } from '@/utils/simulator'
import type { TangpingPersonality } from '@/data/personality'
import { Button } from '@/components/ui/button'

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
  const [saving, setSaving] = useState(false)

  const years = Math.floor(result.totalYears)
  const months = result.totalMonths % 12

  const handleSave = useCallback(async () => {
    if (!cardRef.current || saving) return
    setSaving(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a1a1f',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          // Fix background gradient (oklch compat)
          const el = doc.querySelector('[data-share-card]') as HTMLElement
          if (el) el.style.background = 'linear-gradient(160deg, #0a1a1f 0%, #0d2428 30%, #111820 60%, #0a1215 100%)'
          // Fix gradient text — html2canvas can't render background-clip:text
          // Use personality's primary gradient color instead of hardcoded teal
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
        setSaving(false)
        return
      }

      // Mobile: use native share (LINE, IG, etc). Desktop: download directly.
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
    } catch (err) {
      console.error('ShareCard save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [saving])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* The actual card to be captured — 360×640 for better social sharing */}
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

              {/* Middle — personality + numbers */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                {/* Emoji */}
                <div style={{ fontSize: 56 }}>{personality.emoji}</div>

                {/* Personality name */}
                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: personality.color,
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {personality.name}
                  </p>
                  <p style={{ fontSize: 13, color: '#8a9a9e', marginTop: 6, marginBottom: 0 }}>
                    {personality.title}
                  </p>
                </div>

                {/* Duration */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: '14px 20px',
                    marginTop: 20,
                  }}
                >
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

                {/* Percentile */}
                <div style={{ padding: '0 12px', marginTop: 20 }}>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentile}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${personality.gradient[0]}, ${personality.gradient[1]})`,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: '#8a9a9e', marginTop: 6, marginBottom: 0 }}>
                    勝過 <strong style={{ color: personality.color }}>{percentile}%</strong> 的人
                  </p>
                </div>

                {/* Oneliner */}
                <p
                  style={{
                    fontSize: 14,
                    color: '#a8b8bc',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    padding: '0 8px',
                    marginTop: 20,
                    marginBottom: 0,
                  }}
                >
                  「{personality.oneliner}」
                </p>
              </div>

              {/* Bottom — CTA + branding */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p style={{ fontSize: 13, color: '#8a9a9e', margin: 0 }}>
                  你也來躺平 →
                </p>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: 'rgba(255,255,255,0.1)',
                    margin: '10px auto',
                  }}
                />
                <p style={{ fontSize: 12, color: '#5a6a6e', letterSpacing: 1, margin: 0 }}>
                  tangping.app
                </p>
              </div>
            </div>
          </div>

          {/* Actions below card */}
          <div style={{ display: 'flex', gap: 12, width: 360 }}>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              關閉
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? '儲存中...' : '儲存圖片'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  // Delay cleanup so browser can start the download
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
