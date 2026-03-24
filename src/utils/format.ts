/**
 * 將大數字縮寫為中文單位（萬 / 億 / 兆）
 * 小於 10 萬的數字保持原格式
 */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${(n / 1e12).toFixed(1)} 兆`
  if (abs >= 1e8) return `${(n / 1e8).toFixed(1)} 億`
  if (abs >= 1e5) return `${(n / 1e4).toFixed(0)} 萬`
  return n.toLocaleString('zh-TW')
}
