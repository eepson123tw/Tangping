import {
  CPI_RATE,
  DEPOSIT_RATE,
  SOCIAL_INSURANCE_MONTHLY,
  type CityData,
} from '../data/constants'

export interface SimulationInput {
  savings: number
  monthlySalaryBeforeQuit: number
  city: CityData
  monthlyExpenseOverride?: number
  inflationRate?: number
  depositRate?: number
}

export interface MonthSnapshot {
  month: number
  balance: number
  expense: number
  interest: number
}

export interface SimulationResult {
  totalDays: number
  totalMonths: number
  totalYears: number
  timeline: MonthSnapshot[]
  finalBalance: number
  totalSpent: number
  totalInterestEarned: number
  /** 初始存款（用於人格 & 百分位） */
  initialSavings: number
  /** 每月基本開銷（用於人格判定） */
  monthlyExpense: number
}

/**
 * 模擬躺平：逐月計算存款消耗
 * - 每月扣除生活費（含社保）
 * - 生活費隨 CPI 每年調漲
 * - 存款每月產生利息（定存利率 / 12）
 */
export function simulate(input: SimulationInput): SimulationResult {
  const {
    savings,
    city,
    monthlyExpenseOverride,
    inflationRate = CPI_RATE,
    depositRate = DEPOSIT_RATE,
  } = input

  const baseExpense = monthlyExpenseOverride ?? city.minLivingCost
  const monthlyDepositRate = depositRate / 12

  let balance = savings
  let totalSpent = 0
  let totalInterestEarned = 0
  const timeline: MonthSnapshot[] = []

  // 記錄初始狀態
  timeline.push({
    month: 0,
    balance,
    expense: 0,
    interest: 0,
  })

  let month = 0
  const MAX_MONTHS = 1200 // 100年上限

  while (balance > 0 && month < MAX_MONTHS) {
    month++

    // 每年調漲一次生活費（每 12 個月）
    const yearsElapsed = Math.floor((month - 1) / 12)

    // 生活費 = 基礎生活費 * (1 + CPI)^年數
    // 社保費用不隨通膨調整（由政府另行公告）
    const adjustedLivingCost =
      (baseExpense - SOCIAL_INSURANCE_MONTHLY) *
        Math.pow(1 + inflationRate, yearsElapsed) +
      SOCIAL_INSURANCE_MONTHLY

    // 租金部分額外用租金通膨率（已包含在 minLivingCost 中，這裡用一般通膨近似）
    // 更精確的做法可以拆分租金與其他開銷，但衛福部的最低生活費已是綜合數字
    const monthlyExpense = adjustedLivingCost

    // 存款利息
    const interest = balance * monthlyDepositRate

    // 本月結算
    balance = balance + interest - monthlyExpense
    totalSpent += monthlyExpense
    totalInterestEarned += interest

    timeline.push({
      month,
      balance: Math.max(0, balance),
      expense: monthlyExpense,
      interest,
    })

    if (balance <= 0) break
  }

  // 最後一個月按比例計算（存款不夠撐完整月）
  let fractionalMonths = month
  if (month > 0 && balance < 0) {
    const lastSnapshot = timeline[timeline.length - 1]
    const prevBalance = timeline[timeline.length - 2]?.balance ?? savings
    const lastExpenseNet = lastSnapshot.expense - lastSnapshot.interest
    if (lastExpenseNet > 0) {
      // 上個月底的餘額能撐最後這個月的幾成
      const fraction = prevBalance / lastExpenseNet
      fractionalMonths = month - 1 + Math.min(fraction, 1)
    }
  }

  const totalMonths = month
  const totalDays = Math.max(0, Math.round(fractionalMonths * 30.44))
  const totalYears = fractionalMonths / 12

  return {
    totalDays,
    totalMonths,
    totalYears,
    timeline,
    finalBalance: Math.max(0, balance),
    totalSpent,
    totalInterestEarned,
    initialSavings: savings,
    monthlyExpense: baseExpense,
  }
}
