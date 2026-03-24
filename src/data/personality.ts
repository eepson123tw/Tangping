/**
 * 躺平人格系統
 * 根據存款金額 × 躺平天數 × 月開銷水準分配人格原型
 */

export interface TangpingPersonality {
  id: string
  name: string
  emoji: string
  title: string
  description: string
  /** 搞笑一句話 — 用於分享卡片 */
  oneliner: string
  color: string
  gradient: [string, string]
}

const PERSONALITIES: TangpingPersonality[] = [
  {
    id: 'instant-noodle',
    name: '泡麵戰士',
    emoji: '🍜',
    title: '速食躺平型',
    description: '你的躺平比泡麵的保質期還短，但至少你試過了。',
    oneliner: '躺平三分鐘，泡麵剛好熟',
    color: '#ff6b6b',
    gradient: ['#ff6b6b', '#ee5a24'],
  },
  {
    id: 'moonlight',
    name: '月光仙子',
    emoji: '🌙',
    title: '薪水歸零型',
    description: '每個月薪水花光光，躺平對你來說是一種奢侈。',
    oneliner: '存款跟你的未讀訊息一樣，都是零',
    color: '#a29bfe',
    gradient: ['#a29bfe', '#6c5ce7'],
  },
  {
    id: 'gap-year',
    name: '間隔年旅人',
    emoji: '🎒',
    title: 'Gap Year 型',
    description: '足夠來一趟說走就走的半年旅程，但別太浪。',
    oneliner: '護照準備好了嗎？反正時間有的是',
    color: '#ffd93d',
    gradient: ['#ffd93d', '#f0932b'],
  },
  {
    id: 'cafe-nomad',
    name: '咖啡廳數位遊牧',
    emoji: '☕',
    title: '假裝在工作型',
    description: '你有足夠的時間坐在咖啡廳假裝寫小說。',
    oneliner: '拿鐵一杯，筆電打開，其實在看Netflix',
    color: '#c49a6c',
    gradient: ['#c49a6c', '#a07850'],
  },
  {
    id: 'homebody',
    name: '居家躺平師',
    emoji: '🛋️',
    title: '沙發馬鈴薯型',
    description: '不出門、不社交、不花錢。你的客廳就是全世界。',
    oneliner: '你跟外送員的關係比跟朋友還親',
    color: '#6bcb77',
    gradient: ['#6bcb77', '#38ada9'],
  },
  {
    id: 'frugal-monk',
    name: '極簡修行者',
    emoji: '🧘',
    title: '苦行僧型',
    description: '一天一餐、手機用到壞、衣服穿到破。你把省錢變成了藝術。',
    oneliner: '你的生活費比一隻貓的伙食費還低',
    color: '#4db8a4',
    gradient: ['#4db8a4', '#2d8a7e'],
  },
  {
    id: 'hermit',
    name: '隱居大師',
    emoji: '🏔️',
    title: '歸隱山林型',
    description: '搬去鄉下，養雞種菜，你的躺平是一場與世隔絕的修行。',
    oneliner: '你可以在山上養雞養到下次總統大選',
    color: '#7a9e7e',
    gradient: ['#7a9e7e', '#4a7a52'],
  },
  {
    id: 'investor',
    name: '被動收入幻想家',
    emoji: '📈',
    title: '理財型躺平',
    description: '靠利息撐著，雖然利息只夠買一杯紅茶。',
    oneliner: '你的利息收入剛好夠付健保費',
    color: '#54a0ff',
    gradient: ['#54a0ff', '#2e86de'],
  },
  {
    id: 'fire-master',
    name: '躺平宗師',
    emoji: '🔥',
    title: 'FIRE 達人型',
    description: '五年以上的躺平資本，你已經不是在躺平，你是在享受人生。',
    oneliner: '朋友還在加班，你已經在看日落',
    color: '#8b83ff',
    gradient: ['#8b83ff', '#6c63ff'],
  },
  {
    id: 'legend',
    name: '躺平之神',
    emoji: '👑',
    title: '傳說級存在',
    description: '十年以上的躺平資本。你不是躺平，你是財富自由。',
    oneliner: '你的存款讓其他人的躺平看起來像午休',
    color: '#c49bff',
    gradient: ['#c49bff', '#9b6dff'],
  },
  {
    id: 'parents-home',
    name: '回巢青年',
    emoji: '🏠',
    title: '靠爸靠媽型',
    description: '住家裡省租金，但每天被問什麼時候去上班。',
    oneliner: '你媽已經問了你第87次「要不要去考公務員」',
    color: '#ff9f43',
    gradient: ['#ff9f43', '#ee8530'],
  },
  {
    id: 'yolo',
    name: '及時行樂派',
    emoji: '🎉',
    title: '人生苦短型',
    description: '錢花得快但活得精彩，你的躺平是場派對。',
    oneliner: '存款像你的手搖飲一樣，喝兩口就沒了',
    color: '#fd79a8',
    gradient: ['#fd79a8', '#e84393'],
  },
]

const PERSONALITY_MAP = new Map(PERSONALITIES.map(p => [p.id, p]))
const find = (id: string) => PERSONALITY_MAP.get(id)!

/**
 * 根據模擬結果分配躺平人格
 * minLivingCost: 該城市官方最低生活費，用來做相對門檻判斷
 */
export function getPersonality(params: {
  totalDays: number
  savings: number
  monthlyExpense: number
  cityName: string
  minLivingCost: number
}): TangpingPersonality {
  const { totalDays, savings, monthlyExpense, cityName, minLivingCost } = params
  const months = totalDays / 30.44

  // === 極端情況 ===
  // 極短 — 泡麵戰士
  if (months < 2) return find('instant-noodle')

  // 存款不到 4 個月開銷 — 月光仙子
  if (savings < monthlyExpense * 4) return find('moonlight')

  // 十年以上 — 躺平之神（極端長一律封神）
  if (months >= 120) return find('legend')

  // === 生活型態（非極端時，生活方式 > 持續時間）===
  // 住家裡（開銷遠低於城市最低生活費）
  if (monthlyExpense < minLivingCost * 0.7 && months < 60) return find('parents-home')

  // 極簡修行（開銷低於城市最低生活費，且能撐一年以上）
  if (monthlyExpense < minLivingCost * 0.9 && months > 12 && months < 60) return find('frugal-monk')

  // === 長期（5 年以上）===
  if (months >= 60) return find('fire-master')

  // === 中期 + 特殊條件 ===
  // 鄉下隱居（非六都 + 2 年以上）
  if (cityName === '其他縣市' && months >= 24) return find('hermit')

  // 被動收入幻想家（高存款但利息不夠活，1-5 年）
  if (savings >= 1_000_000 && months >= 12) return find('investor')

  // 高開銷短期 — 及時行樂（花費高於城市最低 1.4 倍）
  if (monthlyExpense > minLivingCost * 1.4 && months < 24) return find('yolo')

  // === 純持續時間 ===
  if (months >= 24) return find('homebody')
  if (months >= 12) return find('cafe-nomad')
  if (months >= 6) return find('gap-year')

  // 預設（2-6 個月，不算月光）
  return find('gap-year')
}
