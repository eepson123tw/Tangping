import { test, expect } from '@playwright/test'

/**
 * 結果頁面邏輯測試 — 驗證計算修正與 UI 條件渲染
 */

/** 共用：輸入存款與月薪後送出，等待結果頁 */
async function submitAndWaitResult(
  page: import('@playwright/test').Page,
  savings: string,
  salary: string = '',
) {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('躺平模擬器')

  const savingsInput = page.locator('#savings')
  await savingsInput.clear()
  await savingsInput.fill(savings)

  if (salary) {
    const salaryInput = page.locator('#salary')
    await salaryInput.clear()
    await salaryInput.fill(salary)
  }

  await page.getByRole('button', { name: '開始躺平' }).click()
  await expect(page.getByText('你可以躺')).toBeVisible({ timeout: 8000 })
  // Wait for animations to settle
  await page.waitForTimeout(1500)
}

// ─── Bug fix: 存款極低時不應顯示不合理的手搖飲數量 ───

test.describe('零天躺平結果（存款不足一個月）', () => {
  test('存款 87 元 → 0 天，不顯示手搖飲 / 圖表 / 總花費', async ({ page }) => {
    await submitAndWaitResult(page, '87', '0')

    // 應顯示 0 天（紅色大字）
    await expect(page.locator('.text-destructive', { hasText: '0' })).toBeVisible()

    // 不應出現手搖飲趣味對照
    await expect(page.getByText('手搖飲')).not.toBeVisible()

    // 不應出現餘額圖表
    await expect(page.getByText('存款餘額變化')).not.toBeVisible()

    // 不應出現總花費 / 利息統計卡片
    await expect(page.getByText('總花費')).not.toBeVisible()
    await expect(page.getByText('利息收入')).not.toBeVisible()

    // 但仍應顯示人格、描述、結局
    await expect(page.locator('.glass-card').first()).toBeVisible()
    await expect(page.getByText('結束了你的躺平')).toBeVisible()

    // 按鈕仍可用
    await expect(page.getByRole('button', { name: '重新計算' })).toBeVisible()
    await expect(page.getByRole('button', { name: '分享卡片' })).toBeVisible()
  })

  test('存款 100 元 → 0 天，同樣隱藏統計區塊', async ({ page }) => {
    await submitAndWaitResult(page, '100')

    await expect(page.getByText('手搖飲')).not.toBeVisible()
    await expect(page.getByText('總花費')).not.toBeVisible()
  })
})

// ─── 正常情境：有天數時應完整顯示所有區塊 ───

test.describe('正常躺平結果', () => {
  test('存款 50 萬 → 顯示手搖飲、圖表、統計', async ({ page }) => {
    await submitAndWaitResult(page, '500000', '40000')

    // 應有天數（大於 30 天會顯示「年」或「個月」）
    await expect(page.getByText('個月', { exact: true })).toBeVisible()

    // 手搖飲趣味對照應出現
    await expect(page.getByText('手搖飲')).toBeVisible()

    // 餘額圖表應出現
    await expect(page.getByText('存款餘額變化')).toBeVisible()

    // 總花費與利息應出現
    await expect(page.getByText('總花費')).toBeVisible()
    await expect(page.getByText('利息收入')).toBeVisible()
  })

  test('存款 100 萬 → 手搖飲數量合理（> 0 且非天文數字）', async ({ page }) => {
    await submitAndWaitResult(page, '1000000')

    const bobaText = page.getByText('手搖飲')
    await expect(bobaText).toBeVisible()

    // 取得手搖飲數量文字，確認數值合理
    const funFactCard = page.locator('.glass-card', { hasText: '手搖飲' })
    const text = await funFactCard.textContent()
    // 提取數字（可能包含逗號）
    const match = text?.match(/喝\s*([\d,]+)\s*杯/)
    expect(match).toBeTruthy()
    const count = parseInt(match![1].replace(/,/g, ''), 10)
    // 100 萬存款在台北約能撐 3-5 年，花費約 60-100 萬，手搖飲 ~9,000-15,000 杯
    expect(count).toBeGreaterThan(1000)
    expect(count).toBeLessThan(50000)
  })
})

// ─── 邊界情況 ───

test.describe('邊界情況', () => {
  test('存款剛好一個月生活費 → 應有天數且顯示統計', async ({ page }) => {
    // 台北最低生活費約 20,744，給 21000 約撐 30 天
    await submitAndWaitResult(page, '21000')

    // 應顯示「約 X 天」或直接顯示天數
    const hasDays = await page.getByText('天', { exact: true }).isVisible()
    const hasMonths = await page.getByText('個月', { exact: true }).isVisible()
    expect(hasDays || hasMonths).toBeTruthy()

    // 手搖飲應出現（totalDays > 0）
    await expect(page.getByText('手搖飲')).toBeVisible()
  })

  test('超大存款 → 顯示「年」單位', async ({ page }) => {
    await submitAndWaitResult(page, '10000000')

    await expect(page.getByText('年', { exact: true })).toBeVisible()
    await expect(page.getByText('個月', { exact: true })).toBeVisible()
  })

  test('資料來源預設收合', async ({ page }) => {
    await submitAndWaitResult(page, '500000')

    // details 存在但不是 open
    const details = page.locator('details', { hasText: '資料來源' }).last()
    await expect(details).toBeVisible()
    // 內容預設不可見（收合狀態）
    await expect(page.getByText('衛福部 115 年最低生活費公告')).not.toBeVisible()

    // 點開後可見
    await details.locator('summary').click()
    await expect(page.getByText('衛福部 115 年最低生活費公告')).toBeVisible()
  })
})

// ─── RWD 響應式佈局 ───

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 800 },
] as const

test.describe('RWD 響應式佈局', () => {
  for (const vp of viewports) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })

      test('輸入頁面可正常操作', async ({ page }) => {
        await page.goto('/')
        await expect(page.locator('h1')).toContainText('躺平模擬器')

        // 所有輸入元素可見
        await expect(page.locator('#savings')).toBeVisible()
        await expect(page.getByRole('button', { name: '開始躺平' })).toBeVisible()

        // 城市按鈕不會溢出（按鈕區域在視窗內）
        const cityBtn = page.getByRole('button', { name: '台北市' })
        await expect(cityBtn).toBeVisible()
        const box = await cityBtn.boundingBox()
        expect(box).toBeTruthy()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width)
      })

      test('結果頁面不水平溢出', async ({ page }) => {
        await submitAndWaitResult(page, '500000', '40000')

        // 檢查 body 沒有水平捲軸
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1) // 1px tolerance

        // 按鈕在視窗範圍內
        const resetBtn = page.getByRole('button', { name: '重新計算' })
        await expect(resetBtn).toBeVisible()
        const box = await resetBtn.boundingBox()
        expect(box).toBeTruthy()
        expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width)
      })

      test('零天結果頁面高度合理（不會過長）', async ({ page }) => {
        await submitAndWaitResult(page, '87', '0')

        const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
        // 0 天結果不應超過 2.5 個螢幕高度（隱藏了圖表和統計）
        expect(scrollHeight).toBeLessThan(vp.height * 2.5)
      })

      test('正常結果頁面各區塊不超出螢幕寬度', async ({ page }) => {
        await submitAndWaitResult(page, '1000000')

        // 檢查所有 glass-card 都在視窗內
        const cards = page.locator('.glass-card')
        const count = await cards.count()
        for (let i = 0; i < count; i++) {
          const box = await cards.nth(i).boundingBox()
          if (box) {
            expect(box.x).toBeGreaterThanOrEqual(-1) // 1px tolerance
            expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1)
          }
        }
      })
    })
  }
})
