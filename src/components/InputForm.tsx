import { useState, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { CITIES, MEDIAN_SALARY, type CityData } from '@/data/constants'

const SUBTITLES = [
  '輸入你的存款，看看你能躺多久',
  '不想捲了？算算你能躺多久',
  '什麼都漲只有薪水不漲，不如先躺一下',
  '社畜的盡頭是躺平',
  '算完你就知道，為什麼不能裸辭',
  '離職前先算一下，理性躺平',
]
import { simulate, type SimulationResult } from '@/utils/simulator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const Scene3D = lazy(() => import('./Scene3D'))

interface Props {
  onResult: (result: SimulationResult, city: CityData) => void
}

function formatNumber(n: number): string {
  return n.toLocaleString('zh-TW')
}

function parseFormattedNumber(s: string): number {
  return parseInt(s.replace(/,/g, ''), 10) || 0
}

export default function InputForm({ onResult }: Props) {
  const [savings, setSavings] = useState('87')
  const [salary, setSalary] = useState('')
  const [cityIndex, setCityIndex] = useState(0)
  const [customExpense, setCustomExpense] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  const selectedCity = CITIES[cityIndex]
  const subtitle = useMemo(() => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)], [])

  const handleSubmit = () => {
    const savingsNum = parseFormattedNumber(savings)
    if (savingsNum <= 0) {
      setError('請先輸入你的存款金額！')
      return
    }
    setError('')

    const result = simulate({
      savings: savingsNum,
      monthlySalaryBeforeQuit: parseFormattedNumber(salary) || MEDIAN_SALARY,
      city: selectedCity,
      monthlyExpenseOverride: parseFormattedNumber(customExpense) || undefined,
    })

    onResult(result, selectedCity)
  }

  const handleNumberInput = (value: string, setter: (v: string) => void) => {
    const raw = value.replace(/[^0-9]/g, '')
    if (raw === '') { setter(''); return }
    setter(formatNumber(parseInt(raw, 10)))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/6 blur-[100px]" />
      </div>

      {/* 3D Background — lazy loaded, subtle on mobile */}
      <div className="fixed inset-0 -z-10 opacity-30 md:opacity-50 pointer-events-none">
        <Suspense fallback={null}>
          <Scene3D mode="idle" />
        </Suspense>
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center mb-4 md:mb-8"
      >
        <h1 className="text-3xl md:text-7xl font-black mb-2 bg-linear-to-r from-primary via-accent to-chart-4 bg-clip-text text-transparent">
          躺平模擬器
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {subtitle}
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-6 space-y-5">
          {/* 存款 */}
          <div className="space-y-2">
            <Label htmlFor="savings">目前存款（NT$）</Label>
            <Input
              id="savings"
              inputMode="numeric"
              value={savings}
              onChange={(e) => handleNumberInput(e.target.value, setSavings)}
              placeholder="1,000,000"
              className="text-lg h-12 bg-background/50"
            />
          </div>

          {/* 月薪 */}
          <div className="space-y-2">
            <Label htmlFor="salary">
              離職前月薪（NT$）
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                預設：中位數 {formatNumber(MEDIAN_SALARY)}
              </span>
            </Label>
            <Input
              id="salary"
              inputMode="numeric"
              value={salary}
              onChange={(e) => handleNumberInput(e.target.value, setSalary)}
              placeholder={formatNumber(MEDIAN_SALARY)}
              className="text-lg h-12 bg-background/50"
            />
          </div>

          {/* 城市選擇 */}
          <div className="space-y-2">
            <Label>躺平地點</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="選擇躺平城市">
              {CITIES.map((city, i) => (
                <Button
                  key={city.name}
                  type="button"
                  variant={i === cityIndex ? 'default' : 'outline'}
                  onClick={() => setCityIndex(i)}
                  aria-pressed={i === cityIndex}
                  className="text-xs h-10 px-4"
                >
                  {city.name}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCity.name} 最低生活費：NT$ {formatNumber(selectedCity.minLivingCost)}/月
              （{selectedCity.source}）
            </p>
          </div>

          {/* 進階設定 */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              aria-controls="advanced-settings"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {showAdvanced ? '▴ 收起' : '▾ 自訂月支出等'}進階設定
            </button>

            {showAdvanced && (
              <motion.div
                id="advanced-settings"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 space-y-2"
              >
                <Label htmlFor="custom-expense">
                  自訂每月開銷（NT$）
                  <span className="text-muted-foreground font-normal ml-2 text-xs">
                    留空使用官方最低生活費
                  </span>
                </Label>
                <Input
                  id="custom-expense"
                  inputMode="numeric"
                  value={customExpense}
                  onChange={(e) => handleNumberInput(e.target.value, setCustomExpense)}
                  placeholder={formatNumber(selectedCity.minLivingCost)}
                  className="bg-background/50"
                />
              </motion.div>
            )}
          </div>

          {/* 錯誤提示 */}
          {error && (
            <p role="alert" className="text-destructive text-sm text-center">{error}</p>
          )}

          {/* 提交 */}
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            className="w-full text-lg font-bold h-12"
          >
            開始躺平
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
          數據來源：主計總處、衛福部、勞動部、央行、健保署、勞保局
        </p>
      </motion.div>
    </motion.div>
  )
}
