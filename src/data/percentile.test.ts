import { describe, it, expect } from 'vitest'
import { getSavingsPercentile } from './percentile'

describe('getSavingsPercentile', () => {
  it('returns 0 for zero or negative savings', () => {
    expect(getSavingsPercentile(0)).toBe(0)
    expect(getSavingsPercentile(-100)).toBe(0)
  })

  it('returns low percentile for small savings', () => {
    const p = getSavingsPercentile(50_000)
    expect(p).toBeLessThanOrEqual(20)
    expect(p).toBeGreaterThan(0)
  })

  it('returns ~68 for 1M savings', () => {
    const p = getSavingsPercentile(1_000_000)
    expect(p).toBeGreaterThanOrEqual(65)
    expect(p).toBeLessThanOrEqual(70)
  })

  it('returns 99 for very large savings', () => {
    expect(getSavingsPercentile(50_000_000)).toBe(99)
  })

  it('increases monotonically', () => {
    const amounts = [10_000, 100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]
    let prev = 0
    for (const a of amounts) {
      const p = getSavingsPercentile(a)
      expect(p).toBeGreaterThanOrEqual(prev)
      prev = p
    }
  })

  it('interpolates between data points', () => {
    // 750,000 is between 700,000 (60%) and 1,000,000 (68%)
    const p = getSavingsPercentile(750_000)
    expect(p).toBeGreaterThan(60)
    expect(p).toBeLessThan(68)
  })
})
