import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import type { SimulationResult } from '@/utils/simulator'
import type { CityData } from '@/data/constants'
import { SOCIAL_INSURANCE_MONTHLY } from '@/data/constants'
import { getPersonality } from '@/data/personality'
import { getSavingsPercentile } from '@/data/percentile'
import { generateTimeline, getRandomEnding } from '@/data/events'
import { Button } from '@/components/ui/button'
import CountUp from './CountUp'
import BalanceChart from './BalanceChart'
import EventTimeline from './EventTimeline'
import ShareCard from './ShareCard'

const Scene3D = lazy(() => import('./Scene3D'))

interface Props {
  result: SimulationResult
  city: CityData
  onReset: () => void
}

export default function ResultView({ result, city, onReset }: Props) {
  const [sceneProgress, setSceneProgress] = useState(0)
  const [showShareCard, setShowShareCard] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSceneProgress(0.5), 500)
    return () => clearTimeout(timer)
  }, [])

  const personality = useMemo(
    () =>
      getPersonality({
        totalDays: result.totalDays,
        savings: result.initialSavings,
        monthlyExpense: result.monthlyExpense,
        cityName: city.name,
        minLivingCost: city.minLivingCost,
      }),
    [result, city],
  )

  const percentile = useMemo(
    () => getSavingsPercentile(result.initialSavings),
    [result.initialSavings],
  )

  const lifeEvents = useMemo(
    () => generateTimeline(result.totalMonths),
    [result.totalMonths],
  )

  const ending = useMemo(() => getRandomEnding(), [])

  const years = Math.floor(result.totalYears)
  const months = result.totalMonths % 12

  // 趣味對照
  const bobaCount = Math.round(result.totalSpent / 65)
  const lunchBoxCount = Math.round(result.totalSpent / 100)
  // 台北平均房價約 75 萬/坪（2025 年）
  const taipeiPing = (result.initialSavings / 750000).toFixed(1)

  const [copied, setCopied] = useState(false)

  const handleCopyText = async () => {
    const durationText = result.totalDays < 30
      ? `${result.totalDays} 天`
      : `${years > 0 ? `${years}年` : ''}${months}個月（${result.totalDays}天）`
    const text = `我的躺平人格是「${personality.emoji} ${personality.name}」！\n在${city.name}可以躺平 ${durationText}\n比 ${percentile}% 的人能躺更久\n\n${personality.oneliner}\n\n你也來算算 → tangping.zeabur.app\n#躺平模擬器 #社畜必算 #不想上班`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Ambient glow — personality-colored, stronger presence */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ backgroundColor: `${personality.gradient[0]}20` }}
        />
        <div
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]"
          style={{ backgroundColor: `${personality.gradient[1]}18` }}
        />
      </div>

      {/* 3D Scene — compact */}
      <div className="h-[20vh] relative">
        <Suspense fallback={null}>
          <Scene3D mode="tangping" progress={sceneProgress} />
        </Suspense>
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background pointer-events-none" />
      </div>

      {/* Content */}
      <div className="px-4 pb-12 -mt-4 relative z-10 max-w-md mx-auto space-y-6">

        {/* Personality badge + hero */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="text-center"
        >
          {/* Personality badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
            className="inline-block mb-3"
          >
            <div
              className="glass-card px-5 py-2.5 rounded-full font-bold text-sm inline-flex items-center gap-2"
              style={{
                borderColor: `${personality.color}44`,
                background: `linear-gradient(135deg, ${personality.gradient[0]}15, ${personality.gradient[1]}15)`,
              }}
            >
              <span className="text-2xl">{personality.emoji}</span>
              <div className="text-left">
                <span style={{ color: personality.color }}>{personality.name}</span>
                <span className="block text-xs text-muted-foreground font-normal">{personality.title}</span>
              </div>
            </div>
          </motion.div>

          <p className="text-muted-foreground mb-2">在{city.name}，你可以躺</p>

          {/* Big numbers with gradient */}
          <div className="flex items-baseline justify-center gap-1">
            {result.totalDays === 0 ? (
              <>
                <span className="text-5xl md:text-6xl font-black text-destructive">0</span>
                <span className="text-lg text-muted-foreground font-medium">天</span>
              </>
            ) : result.totalDays < 30 ? (
              <>
                <CountUp
                  value={result.totalDays}
                  className="text-6xl md:text-8xl font-black bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
                  duration={1.5}
                />
                <span className="text-lg text-muted-foreground font-medium">天</span>
              </>
            ) : (
              <>
                {years > 0 && (
                  <>
                    <CountUp
                      value={years}
                      className="text-6xl md:text-8xl font-black bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
                      duration={1.5}
                    />
                    <span className="text-lg text-muted-foreground font-medium">年</span>
                  </>
                )}
                <CountUp
                  value={months}
                  className="text-6xl md:text-8xl font-black bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
                  duration={1.5}
                />
                <span className="text-lg text-muted-foreground font-medium">個月</span>
              </>
            )}
          </div>

          {result.totalDays >= 30 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground text-sm mt-1"
            >
              約 {result.totalDays.toLocaleString('zh-TW')} 天
            </motion.p>
          )}
        </motion.div>

        {/* Personality description + percentile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-xl py-3 px-4 text-center space-y-2"
        >
          <p className="font-medium" style={{ color: personality.color }}>
            {personality.description}
          </p>
          <p className="text-xs italic text-muted-foreground">
            「{personality.oneliner}」
          </p>
          {/* Percentile bar */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>你的存款實力</span>
              <span>勝過 {percentile}% 的人</span>
            </div>
            <div className="h-2 rounded-full bg-border/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentile}%` }}
                transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${personality.gradient[0]}, ${personality.gradient[1]})`,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* 以下區塊僅在有實際躺平天數時才顯示 */}
        {result.totalDays > 0 && (
          <>
            {/* Fun fact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass-card rounded-xl py-3 px-4 text-center"
            >
              <p className="text-xs text-muted-foreground leading-relaxed space-y-0.5">
                <span className="block">🧋 相當於喝 <span className="text-accent font-bold">{bobaCount.toLocaleString('zh-TW')}</span> 杯手搖飲的人生</span>
                <span className="block">🍱 或是吃 <span className="text-accent font-bold">{lunchBoxCount.toLocaleString('zh-TW')}</span> 個排骨便當</span>
                <span className="block">🏠 你的存款在台北買得起 <span className="text-accent font-bold">{taipeiPing}</span> 坪{parseFloat(taipeiPing) < 1 ? '（連廁所都不夠）' : parseFloat(taipeiPing) < 3 ? '（大概一間廁所）' : ''}</span>
                <span className="block">📉 通膨年蝕 {(result.monthlyExpense * 0.017 * 12).toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元，利息只多撐 {Math.round(result.totalInterestEarned / result.monthlyExpense)} 個月</span>
              </p>
            </motion.div>

            {/* Balance chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-xl py-4 px-4"
            >
              <BalanceChart timeline={result.timeline} />
            </motion.div>

            {/* Stats grid — essential 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <StatCard label="總花費" value={result.totalSpent} prefix="NT$ " color="#ff6b6b" icon="💸" />
              <StatCard label="利息收入" value={result.totalInterestEarned} prefix="NT$ " color="#4db8a4" icon="🏦" />
            </motion.div>
          </>
        )}

        {/* Detail stats — collapsible */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground/60 transition-colors text-center">
            計算詳情（月支出、社保）
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StatCard label="每月生活費" value={result.monthlyExpense} prefix="NT$ " color="#e8b84a" icon="🧾" />
            <StatCard label="每月社保" value={SOCIAL_INSURANCE_MONTHLY} prefix="NT$ " color="#4db8a4" icon="🏥" />
          </div>
        </details>

        {/* Ending — moved before timeline for emotional impact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-xl py-4 px-5 text-center"
          style={{
            borderColor: `${personality.color}33`,
            background: `linear-gradient(135deg, ${personality.gradient[0]}08, ${personality.gradient[1]}08)`,
          }}
        >
          <p className="text-xs text-muted-foreground mb-1.5">是什麼結束了你的躺平？</p>
          <p className="text-sm font-medium leading-relaxed">{ending}</p>
        </motion.div>

        {/* Life events timeline — collapsible to reduce scroll */}
        {lifeEvents.length > 0 && (
          <details className="glass-card rounded-xl py-4 px-4">
            <summary className="cursor-pointer text-xs font-medium text-foreground/80 text-center hover:text-foreground/60 transition-colors">
              躺平大事記（{lifeEvents.length} 件事）
            </summary>
            <div className="mt-3">
              <EventTimeline events={lifeEvents} totalMonths={result.totalMonths} />
            </div>
          </details>
        )}

        {/* Source — collapsed */}
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground"
        >
          <summary className="cursor-pointer hover:text-foreground/60 transition-colors text-center">
            資料來源
          </summary>
          <div className="glass-card rounded-xl py-3 px-4 mt-2">
            <ul className="space-y-0.5">
              <li>生活費：衛福部 115 年最低生活費公告</li>
              <li>通膨率 1.7%：主計總處 114 年 CPI</li>
              <li>定存利率 1.7%：台灣銀行牌告利率</li>
              <li>社保 {SOCIAL_INSURANCE_MONTHLY.toLocaleString()}/月：健保署 + 勞保局</li>
            </ul>
          </div>
        </motion.details>

        {/* Actions — share primary, others secondary */}
        <div className="space-y-3 pt-2">
          <Button className="w-full h-12 text-base font-bold" onClick={() => setShowShareCard(true)}>
            📤 分享卡片
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={handleCopyText}
            >
              {copied ? '已複製！' : '複製文字'}
            </Button>
            <Button variant="outline" className="flex-1 h-11" onClick={onReset}>
              重新計算
            </Button>
          </div>
        </div>

        {/* Share card modal */}
        {showShareCard && (
          <ShareCard
            result={result}
            personality={personality}
            percentile={percentile}
            cityName={city.name}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  prefix = '',
  color,
  icon,
}: {
  label: string
  value: number
  prefix?: string
  color: string
  icon: string
}) {
  return (
    <div className="glass-card rounded-xl py-3 px-4">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <CountUp value={value} prefix={prefix} className="text-sm font-bold truncate block" duration={2} />
      <div className="mt-1.5 h-0.5 rounded-full" style={{ backgroundColor: color, opacity: 0.5 }} />
    </div>
  )
}
