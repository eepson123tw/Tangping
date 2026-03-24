import { useEffect, useRef } from 'react'
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

  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  // Update DOM directly via subscription — avoids setState on every animation frame
  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v
    })
    return unsubscribe
  }, [display])

  return <motion.span ref={ref} className={className}>{`${prefix}0${suffix}`}</motion.span>
}
