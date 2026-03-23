import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export default function CountUp({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: Props) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => {
    const num = decimals > 0 ? v.toFixed(decimals) : Math.round(v)
    return `${prefix}${Number(num).toLocaleString('zh-TW', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  })

  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v))
    return unsubscribe
  }, [display])

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  )
}
