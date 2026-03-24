import { test, expect } from '@playwright/test'

test.describe('躺平模擬器 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for app to render
    await expect(page.locator('h1')).toContainText('躺平模擬器')
  })

  test('input page renders with default values', async ({ page }) => {
    // Title
    await expect(page.locator('h1')).toBeVisible()

    // Savings input with default 87
    const savingsInput = page.locator('#savings')
    await expect(savingsInput).toHaveValue('87')

    // City buttons visible
    await expect(page.getByRole('button', { name: '台北市' })).toBeVisible()
    await expect(page.getByRole('button', { name: '台南市' })).toBeVisible()

    // Submit button
    await expect(page.getByRole('button', { name: '開始躺平' })).toBeVisible()
  })

  test('shows error when savings is empty', async ({ page }) => {
    // Clear savings
    const savingsInput = page.locator('#savings')
    await savingsInput.clear()

    // Click submit
    await page.getByRole('button', { name: '開始躺平' }).click()

    // Should show error
    await expect(page.getByText('請先輸入你的存款金額')).toBeVisible()
  })

  test('full flow: input → loading → result with 1M savings', async ({ page }) => {
    // Enter 1M savings
    const savingsInput = page.locator('#savings')
    await savingsInput.clear()
    await savingsInput.fill('1000000')

    // Click submit
    await page.getByRole('button', { name: '開始躺平' }).click()

    // Loading screen — text is randomized, check for any loading indicator
    await expect(page.locator('.animate-spin').or(page.getByText('...'))).toBeVisible()

    // Wait for result page (loading takes ~2.2s)
    await expect(page.getByText('你可以躺')).toBeVisible({ timeout: 5000 })

    // Should show duration in months
    await expect(page.getByText('個月', { exact: true })).toBeVisible()

    // Should show personality and timeline summary
    await expect(page.locator('summary', { hasText: '躺平大事記' })).toBeVisible()

    // Action buttons
    await expect(page.getByRole('button', { name: '重新計算' })).toBeVisible()
    await expect(page.getByRole('button', { name: '分享卡片' })).toBeVisible()
  })

  test('tiny savings (222) shows 0 天', async ({ page }) => {
    const savingsInput = page.locator('#savings')
    await savingsInput.clear()
    await savingsInput.fill('222')

    await page.getByRole('button', { name: '開始躺平' }).click()

    // Wait for result
    await expect(page.getByText('你可以躺')).toBeVisible({ timeout: 5000 })

    // Should show 0 天
    await expect(page.getByText('天', { exact: true })).toBeVisible()
  })

  test('switching city updates info text', async ({ page }) => {
    // Click 台南市
    await page.getByRole('button', { name: '台南市' }).click()

    // Info text should update
    await expect(page.getByText('台南市 最低生活費')).toBeVisible()
  })

  test('reset button goes back to input', async ({ page }) => {
    // Submit
    await page.getByRole('button', { name: '開始躺平' }).click()

    // Wait for result
    await expect(page.getByText('你可以躺')).toBeVisible({ timeout: 5000 })

    // Click reset
    await page.getByRole('button', { name: '重新計算' }).click()

    // Should be back on input page
    await expect(page.locator('h1')).toContainText('躺平模擬器')
    await expect(page.locator('#savings')).toBeVisible()
  })

  test('share card modal opens and auto-generates', async ({ page }) => {
    await page.getByRole('button', { name: '開始躺平' }).click()
    await expect(page.getByText('你可以躺')).toBeVisible({ timeout: 5000 })

    // Open share card — auto-generates and shows status
    await page.getByRole('button', { name: '分享卡片' }).click()

    // Modal should appear with generating or done status
    await expect(
      page.getByText('產生分享圖片中').or(page.getByText('圖片已儲存'))
    ).toBeVisible({ timeout: 5000 })
  })
})
