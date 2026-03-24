import { describe, it, expect } from 'vitest'
import { simulate } from './simulator'
import { CITIES, SOCIAL_INSURANCE_MONTHLY } from '../data/constants'

const taipei = CITIES[0] // 台北市, minLivingCost: 20744
const tainan = CITIES[5] // 台南市, minLivingCost: 15515

describe('simulate', () => {
  it('returns 0 days for tiny savings (222 元)', () => {
    const result = simulate({
      savings: 222,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.totalDays).toBe(0)
    expect(result.totalMonths).toBeLessThanOrEqual(1)
  })

  it('returns 0 days for zero savings', () => {
    const result = simulate({
      savings: 0,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.totalDays).toBe(0)
    expect(result.totalMonths).toBe(0)
  })

  it('calculates fractional days for partial-month savings', () => {
    // ~10000 元在台北 (月支出 ~20744) → 大約能撐半個月
    const result = simulate({
      savings: 10000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.totalDays).toBeGreaterThan(0)
    expect(result.totalDays).toBeLessThan(30)
    expect(result.totalMonths).toBe(0) // didn't survive a full month
  })

  it('1M savings in Taipei lasts about 3-6 years', () => {
    const result = simulate({
      savings: 1_000_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.totalYears).toBeGreaterThan(3)
    expect(result.totalYears).toBeLessThan(6)
    expect(result.totalDays).toBeGreaterThan(365 * 3)
  })

  it('same savings lasts longer in cheaper city', () => {
    const resultTaipei = simulate({
      savings: 1_000_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    const resultTainan = simulate({
      savings: 1_000_000,
      monthlySalaryBeforeQuit: 37274,
      city: tainan,
    })
    expect(resultTainan.totalDays).toBeGreaterThan(resultTaipei.totalDays)
  })

  it('custom expense override works', () => {
    const resultDefault = simulate({
      savings: 500_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    const resultCheap = simulate({
      savings: 500_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
      monthlyExpenseOverride: 10000,
    })
    expect(resultCheap.totalDays).toBeGreaterThan(resultDefault.totalDays)
  })

  it('timeline starts with initial balance and ends near zero', () => {
    const result = simulate({
      savings: 500_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.timeline[0].balance).toBe(500_000)
    expect(result.timeline[0].month).toBe(0)
    expect(result.timeline[result.timeline.length - 1].balance).toBe(0)
  })

  it('interest is earned each month', () => {
    const result = simulate({
      savings: 1_000_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    expect(result.totalInterestEarned).toBeGreaterThan(0)
    // First month interest on 1M at 1.7% / 12 ≈ 1417
    const firstInterest = result.timeline[1].interest
    expect(firstInterest).toBeCloseTo(1_000_000 * 0.017 / 12, 0)
  })

  it('inflation increases expenses over time', () => {
    const result = simulate({
      savings: 2_000_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    const month1Expense = result.timeline[1].expense
    const month13Expense = result.timeline[13].expense // 2nd year
    expect(month13Expense).toBeGreaterThan(month1Expense)
  })

  it('social insurance is included in expenses', () => {
    const result = simulate({
      savings: 500_000,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
    })
    // Month 1 expense should be at least the social insurance amount
    expect(result.timeline[1].expense).toBeGreaterThan(SOCIAL_INSURANCE_MONTHLY)
    // And at least the city min living cost
    expect(result.timeline[1].expense).toBeGreaterThanOrEqual(taipei.minLivingCost)
  })

  it('very large savings hits MAX_MONTHS cap', () => {
    const result = simulate({
      savings: 999_999_999,
      monthlySalaryBeforeQuit: 37274,
      city: taipei,
      monthlyExpenseOverride: 1, // basically free living
    })
    // With almost no expenses and huge savings, interest > expense → never runs out
    // Should hit 1200 month cap
    expect(result.totalMonths).toBe(1200)
  })

  it('initialSavings and monthlyExpense are preserved in result', () => {
    const result = simulate({
      savings: 777_777,
      monthlySalaryBeforeQuit: 37274,
      city: tainan,
    })
    expect(result.initialSavings).toBe(777_777)
    expect(result.monthlyExpense).toBe(tainan.minLivingCost)
  })
})
