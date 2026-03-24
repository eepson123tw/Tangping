import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getPersonality } from '@/data/personality'
import type { SimulationResult } from '@/utils/simulator'
import type { CityData } from '@/data/constants'

interface Props {
  result: SimulationResult
  city: CityData
  onDone: () => void
}

export default function LoadingReveal({ result, city, onDone }: Props) {
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

  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {/* Personality emoji drop */}
      <motion.div
        initial={{ y: -100, opacity: 0, rotateY: 0 }}
        animate={{ y: 0, opacity: 1, rotateY: 720 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-7xl mb-8"
      >
        {personality.emoji}
      </motion.div>

      {/* Calculating text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0.5] }}
        transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
        className="text-xl text-muted-foreground"
      >
        計算你的躺平潛力...
      </motion.p>

      {/* Pulsing dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.3 }}
            animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  )
}
