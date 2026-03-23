import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SimulationResult } from '../utils/simulator'
import type { CityData } from '../data/constants'
import { getTangpingLevel, SOCIAL_INSURANCE_MONTHLY } from '../data/constants'
import CountUp from './CountUp'
import BalanceChart from './BalanceChart'
import Scene3D from './Scene3D'

interface Props {
  result: SimulationResult
  city: CityData
  onReset: () => void
}

export default function ResultView({ result, city, onReset }: Props) {
  const level = getTangpingLevel(result.totalDays)
  const [sceneProgress, setSceneProgress] = useState(0)

  // Animate scene progress
  useEffect(() => {
    const timer = setTimeout(() => setSceneProgress(0.5), 1000)
    return () => clearTimeout(timer)
  }, [])

  const years = Math.floor(result.totalYears)
  const months = result.totalMonths % 12

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* 3D Scene - top section */}
      <div className="h-[40vh] md:h-[50vh] relative">
        <Scene3D mode="tangping" progress={sceneProgress} />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-dark)] pointer-events-none" />

        {/* Level badge floating over 3D */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="absolute top-6 left-1/2 -translate-x-1/2"
        >
          <div
            className="px-6 py-3 rounded-full text-white font-bold text-lg backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${level.color}33` }}
          >
            <span className="text-2xl mr-2">{level.emoji}</span>
            {level.name}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pb-12 -mt-16 relative z-10 max-w-lg mx-auto">
        {/* Main result */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <p className="text-gray-400 mb-2">在{city.name}，你可以躺</p>
          <div className="flex items-baseline justify-center gap-2">
            {years > 0 && (
              <>
                <CountUp
                  value={years}
                  className="text-6xl md:text-8xl font-black"
                  duration={1.5}
                />
                <span className="text-2xl text-gray-400">年</span>
              </>
            )}
            <CountUp
              value={months}
              className="text-6xl md:text-8xl font-black"
              duration={1.5}
            />
            <span className="text-2xl text-gray-400">個月</span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-gray-500 mt-2"
          >
            約 <span className="text-white">{result.totalDays.toLocaleString('zh-TW')}</span> 天
          </motion.p>
        </motion.div>

        {/* Level description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8 px-6 py-4 rounded-2xl bg-[var(--color-dark-card)] border border-[var(--color-dark-border)]"
        >
          <p className="text-lg" style={{ color: level.color }}>
            {level.description}
          </p>
        </motion.div>

        {/* Balance chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8 p-4 rounded-2xl bg-[var(--color-dark-card)] border border-[var(--color-dark-border)]"
        >
          <BalanceChart timeline={result.timeline} />
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <StatCard
            label="總花費"
            value={result.totalSpent}
            prefix="NT$ "
            color="var(--color-warm)"
          />
          <StatCard
            label="利息收入"
            value={result.totalInterestEarned}
            prefix="NT$ "
            color="var(--color-green)"
          />
          <StatCard
            label="每月生活費"
            value={city.minLivingCost}
            prefix="NT$ "
            color="var(--color-gold)"
          />
          <StatCard
            label="每月社保"
            value={SOCIAL_INSURANCE_MONTHLY}
            prefix="NT$ "
            color="var(--color-accent-light)"
          />
        </motion.div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mb-8 text-sm text-gray-500"
        >
          <p>
            通膨每年吃掉你 {((city.minLivingCost * 0.017 * 12)).toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元的購買力
          </p>
          <p>
            定存利息{result.totalInterestEarned > result.totalSpent * 0.01 ? '只' : '僅'}幫你多撐了{' '}
            {Math.round(result.totalInterestEarned / city.minLivingCost)} 個月
          </p>
        </motion.div>

        {/* Source info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mb-8 p-4 rounded-xl bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] text-xs text-gray-600"
        >
          <p className="font-bold text-gray-500 mb-2">資料來源</p>
          <ul className="space-y-1">
            <li>生活費：衛福部 115 年最低生活費公告</li>
            <li>通膨率 1.7%：主計總處 114 年 CPI</li>
            <li>定存利率 1.7%：台灣銀行牌告利率</li>
            <li>社保 {SOCIAL_INSURANCE_MONTHLY.toLocaleString()}/月：健保署 + 勞保局</li>
          </ul>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex-1 py-3 bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] text-gray-400 rounded-xl hover:border-[var(--color-accent)] transition-colors"
          >
            重新計算
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const text = `我在${city.name}可以躺平 ${years > 0 ? `${years}年` : ''}${months}個月（${result.totalDays}天）！等級：${level.emoji} ${level.name}\n\n躺平模擬器`
              navigator.clipboard?.writeText(text)
            }}
            className="flex-1 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-white font-bold rounded-xl"
          >
            複製分享
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  prefix = '',
  color,
}: {
  label: string
  value: number
  prefix?: string
  color: string
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-dark-card)] border border-[var(--color-dark-border)]">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <CountUp
        value={value}
        prefix={prefix}
        className="text-lg font-bold"
        duration={2}
      />
      <div className="mt-2 h-0.5 rounded-full opacity-30" style={{ backgroundColor: color }} />
    </div>
  )
}
