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
export interface FunFact {
  emoji: string
  /** 用 {n} 作為數量佔位符 */
  template: string
  /** 單價（元） */
  unitPrice: number
}

export interface CityData {
  name: string
  minLivingCost: number
  /** 衛福部公告最低生活費 */
  source: string
  /** 每坪房價（萬元），用於趣味對照 */
  pricePerPing: number
  /** 便當均價（元） */
  lunchPrice: number
  /** 趣味對照的在地化描述 */
  flavor: string
  /** 在地化趣味對照（每次隨機選 2 項顯示） */
  funFacts: FunFact[]
}

export const CITIES: CityData[] = [
  { name: '台北市', minLivingCost: 20744, source: '衛福部 115年公告', pricePerPing: 75, lunchPrice: 110, flavor: '在台北買得起', funFacts: [
    { emoji: '🚇', template: '{n} 張捷運 TPASS 月票', unitPrice: 1280 },
    { emoji: '🏠', template: '{n} 個月的台北雅房租金', unitPrice: 8000 },
    { emoji: '🎬', template: '看 {n} 場電影', unitPrice: 300 },
    { emoji: '💪', template: '{n} 個月的健身房會籍（雖然你在躺平）', unitPrice: 1321 },
  ]},
  { name: '新北市', minLivingCost: 17750, source: '衛福部 115年公告', pricePerPing: 45, lunchPrice: 90, flavor: '在新北買得起', funFacts: [
    { emoji: '🚇', template: '{n} 張 TPASS 基北北桃月票', unitPrice: 1200 },
    { emoji: '🏠', template: '{n} 個月的新北套房租金', unitPrice: 10000 },
    { emoji: '🎬', template: '看 {n} 場電影', unitPrice: 300 },
  ]},
  { name: '桃園市', minLivingCost: 17186, source: '衛福部 115年公告', pricePerPing: 38, lunchPrice: 80, flavor: '在桃園買得起', funFacts: [
    { emoji: '✈️', template: '{n} 張桃園飛東京的機票（再見台灣）', unitPrice: 3500 },
    { emoji: '🫘', template: '{n} 份大溪老阿伯現滷豆干', unitPrice: 145 },
    { emoji: '🐧', template: '逛 {n} 次 Xpark 看企鵝', unitPrice: 600 },
    { emoji: '🚇', template: '{n} 個月的 TPASS 月票通勤台北', unitPrice: 1200 },
  ]},
  { name: '台中市', minLivingCost: 16431, source: '衛福部 115年公告', pricePerPing: 42, lunchPrice: 80, flavor: '在台中買得起', funFacts: [
    { emoji: '🧋', template: '{n} 杯春水堂珍奶（發源地正宗的！）', unitPrice: 190 },
    { emoji: '🍦', template: '{n} 球宮原眼科冰淇淋', unitPrice: 90 },
    { emoji: '🌙', template: '在逢甲夜市吃 {n} 頓', unitPrice: 180 },
    { emoji: '☕', template: '{n} 杯台中文青咖啡', unitPrice: 160 },
  ]},
  { name: '高雄市', minLivingCost: 16970, source: '衛福部 115年公告', pricePerPing: 22, lunchPrice: 75, flavor: '在高雄買得起', funFacts: [
    { emoji: '🍔', template: '{n} 份丹丹漢堡套餐（南部限定！）', unitPrice: 99 },
    { emoji: '⛴️', template: '搭 {n} 趟旗津渡輪看海', unitPrice: 20 },
    { emoji: '🦑', template: '{n} 支旗津烤小卷', unitPrice: 50 },
    { emoji: '🚃', template: '{n} 張高雄通勤月票（捷運+輕軌+公車全包）', unitPrice: 399 },
  ]},
  { name: '台南市', minLivingCost: 15515, source: '衛福部 115年公告', pricePerPing: 20, lunchPrice: 70, flavor: '在台南買得起', funFacts: [
    { emoji: '🥩', template: '{n} 碗台南溫體牛肉湯（清晨五點排的）', unitPrice: 130 },
    { emoji: '🍚', template: '{n} 碗矮仔成蝦仁飯', unitPrice: 65 },
    { emoji: '🍮', template: '{n} 碗同記安平豆花', unitPrice: 40 },
    { emoji: '🧃', template: '{n} 杯台南全糖紅茶（無糖在台南是犯法的）', unitPrice: 25 },
  ]},
  { name: '新竹市', minLivingCost: 15515, source: '衛福部 115年公告（臺灣省）', pricePerPing: 30, lunchPrice: 85, flavor: '在新竹買得起', funFacts: [
    { emoji: '🥟', template: '{n} 碗城隍廟貢丸湯', unitPrice: 45 },
    { emoji: '🌀', template: '{n} 把在新竹被風吹壞的傘', unitPrice: 150 },
    { emoji: '🍜', template: '{n} 盤城隍廟炒米粉', unitPrice: 45 },
  ]},
  { name: '竹北天龍區', minLivingCost: 18500, source: '竹科工程師含淚估算', pricePerPing: 55, lunchPrice: 100, flavor: '在竹北買得起', funFacts: [
    { emoji: '🅿️', template: '竹北 {n} 個月的停車費', unitPrice: 3000 },
    { emoji: '🥩', template: '{n} 次夏慕尼鐵板燒', unitPrice: 1309 },
    { emoji: '📦', template: '{n} 次竹科園區外送便當', unitPrice: 90 },
    { emoji: '☕', template: '{n} 杯竹北星巴克', unitPrice: 120 },
  ]},
  { name: '信義區貴婦', minLivingCost: 25000, source: '一杯咖啡 200 起跳的地方', pricePerPing: 120, lunchPrice: 180, flavor: '在信義區買得起', funFacts: [
    { emoji: '☕', template: '{n} 杯信義區星巴克', unitPrice: 180 },
    { emoji: '🍽️', template: '在微風美食街吃 {n} 頓午餐', unitPrice: 350 },
    { emoji: '🏙️', template: '上 {n} 次 101 觀景台', unitPrice: 600 },
    { emoji: '🏠', template: '{n} 個月的信義區套房租金', unitPrice: 22000 },
  ]},
  { name: '花東慢活', minLivingCost: 13000, source: '鄰居是山跟海', pricePerPing: 12, lunchPrice: 65, flavor: '在花東買得起', funFacts: [
    { emoji: '🧅', template: '{n} 個花蓮炸彈蔥油餅（加蛋）', unitPrice: 40 },
    { emoji: '🏄', template: '在台東衝 {n} 次浪', unitPrice: 1800 },
    { emoji: '🎈', template: '搭 {n} 次台東熱氣球', unitPrice: 500 },
    { emoji: '♨️', template: '泡 {n} 次知本溫泉', unitPrice: 100 },
  ]},
  { name: '其他縣市', minLivingCost: 15515, source: '衛福部 115年公告', pricePerPing: 18, lunchPrice: 75, flavor: '在當地買得起', funFacts: [
    { emoji: '🎬', template: '看 {n} 場電影', unitPrice: 300 },
    { emoji: '🏠', template: '{n} 個月的套房租金', unitPrice: 7000 },
  ]},
]

