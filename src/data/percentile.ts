/**
 * 百分位排名估算
 * 根據主計總處 113 年薪資分布數據推算
 * 假設：儲蓄率約 20-30%，工作年數 3-15 年
 * 來源：主計總處 113年受僱員工薪資中位數統計
 */

// 台灣工作人口的估計存款分布（累積百分比）
// 基於薪資中位數 37,274/月、儲蓄率約 25%、工作 5-10 年的粗略推算
const SAVINGS_PERCENTILES: [number, number][] = [
  [0, 0],
  [50_000, 15],
  [100_000, 25],
  [200_000, 35],
  [300_000, 42],
  [500_000, 52],
  [700_000, 60],
  [1_000_000, 68],
  [1_500_000, 76],
  [2_000_000, 82],
  [3_000_000, 88],
  [5_000_000, 93],
  [10_000_000, 97],
  [20_000_000, 99],
]

/**
 * 估算你的存款在全台灣工作人口中的百分位
 * 回傳 0-99，表示「你比 X% 的人能躺更久」
 */
export function getSavingsPercentile(savings: number): number {
  if (savings <= 0) return 0

  for (let i = 0; i < SAVINGS_PERCENTILES.length - 1; i++) {
    const [low, pLow] = SAVINGS_PERCENTILES[i]
    const [high, pHigh] = SAVINGS_PERCENTILES[i + 1]
    if (savings >= low && savings < high) {
      // 線性內插
      const ratio = (savings - low) / (high - low)
      return Math.round(pLow + ratio * (pHigh - pLow))
    }
  }

  return 99
}
