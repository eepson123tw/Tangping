import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } })

  // Go to the dev server
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  // Screenshot the input page
  await page.screenshot({ path: 'screenshot-input.png', fullPage: true })
  console.log('Saved screenshot-input.png')

  // Check for console errors
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  // Try entering a value and clicking the button
  const savingsInput = page.locator('input').first()
  await savingsInput.fill('1000000')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshot-filled.png', fullPage: true })
  console.log('Saved screenshot-filled.png')

  // Click the submit button
  const submitBtn = page.getByText('開始躺平')
  console.log('Button found:', await submitBtn.count())
  await submitBtn.click()
  await page.waitForTimeout(3000)

  // Screenshot after click
  await page.screenshot({ path: 'screenshot-result.png', fullPage: true })
  console.log('Saved screenshot-result.png')

  // Print URL and any console errors
  console.log('Current URL:', page.url())
  console.log('Page title:', await page.title())
  if (errors.length) {
    console.log('Console errors:', errors)
  }

  // Get page content to see what's rendered
  const bodyText = await page.locator('body').innerText()
  console.log('Body text (first 500 chars):', bodyText.slice(0, 500))

  await browser.close()
}

main().catch(console.error)
