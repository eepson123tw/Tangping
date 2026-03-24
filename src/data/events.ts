/**
 * 躺平大事記 — 隨機生活事件
 * 分為四個階段，每次模擬隨機抽取組合
 */

export interface LifeEvent {
  text: string
  month: number // 最早出現的月份
  phase: 'honeymoon' | 'reality' | 'adaptation' | 'finale'
  /** 對存款的影響（負數 = 額外支出） */
  impact?: number
}

const HONEYMOON_EVENTS: LifeEvent[] = [
  { text: '你把鬧鐘 App 刪掉了', month: 0, phase: 'honeymoon' },
  { text: '你終於把 Netflix 片單清完了', month: 1, phase: 'honeymoon' },
  { text: '你開始學吉他，鄰居開始恨你', month: 1, phase: 'honeymoon' },
  { text: '你連續睡了 14 小時，創下個人紀錄', month: 0, phase: 'honeymoon' },
  { text: '你在下午三點去超市，發現打折的秘密', month: 1, phase: 'honeymoon' },
  { text: '你媽打來問你第 1 次：什麼時候回去上班', month: 2, phase: 'honeymoon' },
  { text: '你發現原來白天的電視這麼無聊', month: 1, phase: 'honeymoon' },
  { text: '你第一次在週一早上十點還在睡覺，感覺像犯罪', month: 0, phase: 'honeymoon' },
  { text: '你開始研究怎麼自己煮飯', month: 2, phase: 'honeymoon' },
  { text: '你把所有社群媒體的前同事都設為「隱藏」', month: 1, phase: 'honeymoon' },
  { text: '你把 LinkedIn 通知全部關掉了', month: 0, phase: 'honeymoon' },
  { text: '你終於不用假裝對主管的冷笑話有反應了', month: 0, phase: 'honeymoon' },
  { text: '你發現早上不用擠捷運的世界這麼美好', month: 1, phase: 'honeymoon' },
  { text: '前同事在群組抱怨加班，你默默退出群組', month: 2, phase: 'honeymoon' },
  { text: '你開始認真研究「被動收入」', month: 2, phase: 'honeymoon' },
]

const REALITY_EVENTS: LifeEvent[] = [
  { text: '你的朋友結婚了，紅包 -$3,600', month: 4, phase: 'reality', impact: -3600 },
  { text: '房東說要漲租 +$1,500/月', month: 6, phase: 'reality', impact: -1500 },
  { text: '你的手機螢幕碎了 -$5,000', month: 5, phase: 'reality', impact: -5000 },
  { text: '你媽問你第 15 次：什麼時候回去上班', month: 6, phase: 'reality' },
  { text: '你開始計算每天能花多少錢', month: 4, phase: 'reality' },
  { text: '前同事在 LinkedIn 上升遷了，你假裝沒看到', month: 7, phase: 'reality' },
  { text: '你發現自己已經一週沒出門了', month: 5, phase: 'reality' },
  { text: '你開始在蝦皮上賣二手物品', month: 8, phase: 'reality' },
  { text: '同學會你說「自由接案中」，其實什麼也沒接', month: 6, phase: 'reality' },
  { text: '你的信用卡被降額了', month: 9, phase: 'reality' },
  { text: '你發現全聯週三會員日打 88 折的規律', month: 7, phase: 'reality' },
  { text: '你把 Spotify Premium 降成免費版', month: 5, phase: 'reality' },
  { text: '你把外送 App 解除安裝了，改去全聯買菜', month: 5, phase: 'reality' },
  { text: '前同事在限動分享公司尾牙，你假裝沒看到', month: 8, phase: 'reality' },
  { text: '手搖飲從大杯降級成中杯，再降成自己泡茶', month: 7, phase: 'reality' },
  { text: '你在蝦皮刷免運券，精打細算到極致', month: 6, phase: 'reality' },
  { text: '你的 Netflix 被共用帳號的朋友踢出去了', month: 9, phase: 'reality' },
]

const ADAPTATION_EVENTS: LifeEvent[] = [
  { text: '你學會了自己剪頭髮', month: 10, phase: 'adaptation' },
  { text: '你可以用 15 種方式煮泡麵了', month: 12, phase: 'adaptation' },
  { text: '你開始在公園跑步，因為免費', month: 11, phase: 'adaptation' },
  { text: '你在 Dcard 發了一篇躺平心得，意外破千讚', month: 14, phase: 'adaptation' },
  { text: '你終於看完了一直沒時間看的書', month: 13, phase: 'adaptation' },
  { text: '你開始種陽台菜園，省菜錢', month: 15, phase: 'adaptation' },
  { text: '你的作息變成凌晨 4 點睡、中午 12 點起', month: 12, phase: 'adaptation' },
  { text: '你開始覺得「上班的人好可憐」', month: 18, phase: 'adaptation' },
  { text: '你媽已經放棄叫你去上班了', month: 20, phase: 'adaptation' },
  { text: '你在路上遇到前同事，假裝在講電話避開', month: 16, phase: 'adaptation' },
  { text: '你發現圖書館冷氣免費又有 WiFi', month: 13, phase: 'adaptation' },
  { text: '你的衣櫃已經一年沒買新衣服了', month: 14, phase: 'adaptation' },
  { text: '你開始在 YouTube 看「一天一百元挑戰」', month: 11, phase: 'adaptation' },
  { text: '你學會了用電鍋做出七種料理', month: 12, phase: 'adaptation' },
  { text: '你媽寄了一箱泡麵和罐頭過來，附紙條寫：加油', month: 15, phase: 'adaptation' },
  { text: '你在公園認識了一群退休阿伯，加入他們的早操隊', month: 18, phase: 'adaptation' },
  { text: '你開始覺得圖書館是世界上最棒的地方', month: 16, phase: 'adaptation' },
]

const FINALE_EVENTS: LifeEvent[] = [
  { text: '你打開銀行 App，看到餘額嚇了一跳', month: -3, phase: 'finale' },
  { text: '你開始認真看 104 的職缺了', month: -2, phase: 'finale' },
  { text: '你更新了已經生灰塵的履歷', month: -1, phase: 'finale' },
  { text: '你在面試時被問「這段空白期你在做什麼」', month: -1, phase: 'finale' },
  { text: '你把 PTT 的 Salary 版加入我的最愛', month: -2, phase: 'finale' },
  { text: '你的存款比你的體重還輕了', month: -3, phase: 'finale' },
]

function shufflePick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 根據躺平總月數，生成一條隨機事件時間軸
 */
export type Phase = 'honeymoon' | 'reality' | 'adaptation' | 'finale'

export interface TimelineEntry {
  month: number
  text: string
  phase: Phase
}

export function generateTimeline(totalMonths: number): TimelineEntry[] {
  const events: TimelineEntry[] = []
  const usedMonths = new Set<number>()

  // 找到最近的未被佔用月份
  const claimMonth = (preferred: number): number => {
    const m = Math.max(0, Math.min(preferred, totalMonths - 1))
    let candidate = m
    while (usedMonths.has(candidate) && candidate < totalMonths - 1) candidate++
    if (usedMonths.has(candidate)) {
      candidate = m
      while (usedMonths.has(candidate) && candidate > 0) candidate--
    }
    usedMonths.add(candidate)
    return candidate
  }

  // 蜜月期（前 3 個月）— 使用事件定義的 month
  const honey = shufflePick(HONEYMOON_EVENTS, Math.min(3, totalMonths))
    .sort((a, b) => a.month - b.month)
  honey.forEach((e) => {
    events.push({ month: claimMonth(e.month), text: e.text, phase: 'honeymoon' })
  })

  // 現實期（4-12 個月）
  if (totalMonths > 3) {
    const realityCount = totalMonths > 12 ? 3 : Math.min(2, totalMonths - 3)
    const reality = shufflePick(REALITY_EVENTS, realityCount)
      .sort((a, b) => a.month - b.month)
    reality.forEach((e) => {
      const m = Math.min(e.month, totalMonths - 1)
      events.push({ month: claimMonth(m), text: e.text, phase: 'reality' })
    })
  }

  // 適應期（12 個月+）
  if (totalMonths > 12) {
    const adaptCount = totalMonths > 24 ? 3 : 2
    const adapt = shufflePick(ADAPTATION_EVENTS, adaptCount)
      .sort((a, b) => a.month - b.month)
    adapt.forEach((e) => {
      const m = Math.min(e.month, totalMonths - 2)
      events.push({ month: claimMonth(m), text: e.text, phase: 'adaptation' })
    })
  }

  // 結局期（最後幾個月）— 確保在所有其他事件之後
  if (totalMonths > 6) {
    const lastEventMonth = events.length > 0
      ? Math.max(...events.map(e => e.month))
      : 0
    const finaleStart = Math.max(lastEventMonth + 1, totalMonths - 3)
    const finale = shufflePick(FINALE_EVENTS, 2)
    finale.forEach((e, i) => {
      const m = Math.min(finaleStart + i, totalMonths - 1)
      events.push({ month: claimMonth(m), text: e.text, phase: 'finale' })
    })
  }

  // 按月份排序
  events.sort((a, b) => a.month - b.month)
  return events
}

// === 結局句子 ===
const ENDINGS = [
  '最後一筆支出：全聯的 $79 鮮奶。',
  '你打開 104，搜尋「不用加班」。',
  '你打電話給媽媽：「媽，我回家吃飯。」',
  '你的銀行帳戶餘額：$0。手機跳出繳健保費的通知。',
  '你的躺平之旅在一個週二下午結束。外面在下雨。',
  '你打開求職 App 的那一刻，突然很想念躺在沙發的日子。',
  '遊戲結束。你把鬧鐘 App 重新下載回來了。',
  '你的房東傳來訊息：「下個月的房租...」',
  '你看了一眼存摺，決定明天開始投履歷。',
  '你發了一則限動：「自由接案中，歡迎聯繫」。其實你需要一份正職。',
  '你媽終於等到這一天，開心地幫你燙了面試要穿的襯衫。',
  '你的最後一餐：超商 $39 御飯糰。很好吃。',
  '你回去上班的第一天，同事問你「臉色怎麼這麼好」。',
  '你把「極簡生活」的 YouTube 頻道取消訂閱了。',
  '你在 LinkedIn 更新狀態：Open to Work。',
  '你在面試時被問「對薪資有什麼期待」，你說「有就好」。',
  '你設了一個鬧鐘，鈴聲是你以前最討厭的 Line 工作群通知聲。',
  '你在 104 看到你之前公司的職缺，薪水居然加了兩千。',
  '你開始懷念辦公室的免費咖啡。只有咖啡。',
  '你打開求職網站，搜尋條件第一個勾的是「準時下班」。',
  '你在 Dcard 發文：「躺平心得，不推薦。」',
]

/**
 * 隨機取得一個躺平結局
 */
export function getRandomEnding(): string {
  return ENDINGS[Math.floor(Math.random() * ENDINGS.length)]
}
