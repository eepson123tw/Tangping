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
  ending: string
  onClose: () => void
}

export default function ShareCard({
  result,
  personality,
  percentile,
  cityName,
  ending,
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
        // Force computed styles to avoid oklch issues
        onclone: (doc) => {
          const el = doc.querySelector('[data-share-card]') as HTMLElement
          if (el) el.style.background = 'linear-gradient(160deg, #0a1a1f 0%, #0d2428 30%, #111820 60%, #0a1215 100%)'
        },
      })

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )

      if (!blob) {
        setSaving(false)
        return
      }

      // Try native share first (mobile), then download
      if (navigator.share && navigator.canShare?.({ files: [new File([], '')] })) {
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
          {/* The actual card to be captured */}
          <div
            ref={cardRef}
            data-share-card
            className="w-[270px] rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '9/16',
              background: `linear-gradient(160deg, #0a1a1f 0%, #0d2428 30%, #111820 60%, #0a1215 100%)`,
            }}
          >
            <div className="h-full flex flex-col items-center justify-between py-8 px-5">
              {/* Top */}
              <div className="text-center">
                <p style={{ fontSize: 10, color: '#8a9a9e', letterSpacing: 2 }}>
                  躺 平 模 擬 器
                </p>
              </div>

              {/* Middle — personality + numbers */}
              <div className="text-center space-y-4 w-full">
                {/* Emoji */}
                <div style={{ fontSize: 48 }}>{personality.emoji}</div>

                {/* Personality name */}
                <div>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: personality.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {personality.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#7a8a8e', marginTop: 4 }}>
                    {personality.title}
                  </p>
                </div>

                {/* Duration */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}
                >
                  <p style={{ fontSize: 10, color: '#7a8a8e', marginBottom: 4 }}>
                    在{cityName}可以躺
                  </p>
                  <p
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      background: `linear-gradient(90deg, #4db8a4, #e8b84a)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                    }}
                  >
                    {years > 0 ? `${years}年` : ''}{months}個月
                  </p>
                  <p style={{ fontSize: 10, color: '#6a7a7e', marginTop: 2 }}>
                    約 {result.totalDays.toLocaleString('zh-TW')} 天
                  </p>
                </div>

                {/* Percentile */}
                <div style={{ padding: '0 8px' }}>
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
                  <p style={{ fontSize: 10, color: '#7a8a8e', marginTop: 4 }}>
                    勝過 {percentile}% 的人
                  </p>
                </div>

                {/* Oneliner */}
                <p
                  style={{
                    fontSize: 12,
                    color: '#a0b0b4',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    padding: '0 4px',
                  }}
                >
                  「{personality.oneliner}」
                </p>
              </div>

              {/* Bottom — ending + branding */}
              <div className="text-center w-full space-y-3">
                <p
                  style={{
                    fontSize: 10,
                    color: '#6a7a7e',
                    lineHeight: 1.6,
                    padding: '0 4px',
                  }}
                >
                  {ending}
                </p>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0 auto',
                  }}
                />
                <p style={{ fontSize: 9, color: '#4a5a5e', letterSpacing: 1 }}>
                  tangping.app
                </p>
              </div>
            </div>
          </div>

          {/* Actions below card */}
          <div className="flex gap-3 w-[270px]">
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
