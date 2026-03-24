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
  { name: '新竹市', minLivingCost: 15515, source: '衛福部 115年公告（臺灣省）' },
  { name: '竹北天龍區', minLivingCost: 18500, source: '竹科工程師含淚估算' },
  { name: '其他縣市', minLivingCost: 15515, source: '衛福部 115年公告' },
]

