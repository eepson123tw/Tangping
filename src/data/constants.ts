/**
 * 躺平模擬器 — 台灣經濟數據常數
 * 所有數據來源請見 /data/sources.md
 */

// === 通膨與利率 ===
/** CPI 年增率 — 主計總處 114年 */
export const CPI_RATE = 0.017

/** 房租類 CPI 年增率 — 主計總處 CPI 分類指數 */
export const RENT_INFLATION_RATE = 0.02

/** 台銀一年定存固定利率 — 台灣銀行牌告 */
export const DEPOSIT_RATE = 0.017

// === 社會保險（無工作者）===
/** 健保第六類每月自付 — 衛福部健保署 */
export const NHI_MONTHLY = 826

/** 國民年金每月自付 — 勞保局 */
export const NATIONAL_PENSION_MONTHLY = 1329

/** 無工作者社保月費合計 */
export const SOCIAL_INSURANCE_MONTHLY = NHI_MONTHLY + NATIONAL_PENSION_MONTHLY

// === 薪資 ===
/** 經常性薪資中位數 — 主計總處 113年 */
export const MEDIAN_SALARY = 37274

/** 最低工資 — 勞動部 115年 */
export const MINIMUM_WAGE = 29500

// === 各城市最低生活費（衛福部 115年公告）===
export interface CityData {
  name: string
  minLivingCost: number
  /** 衛福部公告最低生活費 */
  source: string
}

export const CITIES: CityData[] = [
  { name: '台北市', minLivingCost: 20744, source: '衛福部 115年公告' },
  { name: '新北市', minLivingCost: 17750, source: '衛福部 115年公告' },
  { name: '桃園市', minLivingCost: 17186, source: '衛福部 115年公告' },
  { name: '台中市', minLivingCost: 16431, source: '衛福部 115年公告' },
  { name: '高雄市', minLivingCost: 16970, source: '衛福部 115年公告' },
  { name: '台南市', minLivingCost: 15515, source: '衛福部 115年公告' },
  { name: '其他縣市', minLivingCost: 15515, source: '衛福部 115年公告' },
]

// === 躺平等級 ===
export interface TangpingLevel {
  name: string
  emoji: string
  minDays: number
  description: string
  color: string
}

export const TANGPING_LEVELS: TangpingLevel[] = [
  { name: '週末躺', emoji: '😴', minDays: 0, description: '只夠躺個週末', color: '#ff6b6b' },
  { name: '放假躺', emoji: '🛋️', minDays: 30, description: '一個月的自由', color: '#ff9f43' },
  { name: 'Gap Year', emoji: '🎒', minDays: 180, description: '半年探索人生', color: '#ffd93d' },
  { name: '小確幸躺', emoji: '☕', minDays: 365, description: '整整一年不上班', color: '#6bcb77' },
  { name: '資深躺平', emoji: '🏖️', minDays: 730, description: '兩年以上的修行', color: '#54a0ff' },
  { name: '躺平宗師', emoji: '🧘', minDays: 1825, description: '五年以上，已入化境', color: '#8b83ff' },
  { name: '躺平之神', emoji: '👑', minDays: 3650, description: '十年以上，傳說級躺平', color: '#ff6b9d' },
]

export function getTangpingLevel(days: number): TangpingLevel {
  let level = TANGPING_LEVELS[0]
  for (const l of TANGPING_LEVELS) {
    if (days >= l.minDays) level = l
  }
  return level
}
