import { useState } from 'react'
import { motion } from 'framer-motion'
import { CITIES, MEDIAN_SALARY, type CityData } from '../data/constants'
import { simulate, type SimulationResult } from '../utils/simulator'
import Scene3D from './Scene3D'

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
  const [savings, setSavings] = useState('')
  const [salary, setSalary] = useState('')
  const [cityIndex, setCityIndex] = useState(0)
  const [customExpense, setCustomExpense] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  const selectedCity = CITIES[cityIndex]

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

  const handleNumberInput = (
    value: string,
    setter: (v: string) => void,
  ) => {
    const raw = value.replace(/[^0-9]/g, '')
    if (raw === '') {
      setter('')
      return
    }
    setter(formatNumber(parseInt(raw, 10)))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <Scene3D mode="idle" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-[var(--color-accent-light)] via-[var(--color-gold)] to-[var(--color-warm)] bg-clip-text text-transparent">
          躺平模擬器
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          輸入你的存款，看看你能躺多久
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-md space-y-6"
      >
        {/* 存款 */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            目前存款（NT$）
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={savings}
            onChange={(e) => handleNumberInput(e.target.value, setSavings)}
            placeholder="1,000,000"
            className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl text-white text-xl focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* 月薪 */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            離職前月薪（NT$）
            <span className="text-gray-600 ml-2">
              預設：中位數 {formatNumber(MEDIAN_SALARY)}
            </span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={salary}
            onChange={(e) => handleNumberInput(e.target.value, setSalary)}
            placeholder={formatNumber(MEDIAN_SALARY)}
            className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl text-white text-xl focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* 城市選擇 */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            躺平地點
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CITIES.map((city, i) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setCityIndex(i)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  i === cityIndex
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] text-gray-400 hover:border-[var(--color-accent)]'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedCity.name} 最低生活費：NT$ {formatNumber(selectedCity.minLivingCost)}/月
            <span className="ml-1">（{selectedCity.source}）</span>
          </p>
        </div>

        {/* 進階設定 */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-500 hover:text-[var(--color-accent)] transition-colors"
          >
            {showAdvanced ? '收起' : '展開'}進階設定 ▾
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  自訂每月開銷（NT$）
                  <span className="text-gray-600 ml-2">留空使用官方最低生活費</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customExpense}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, setCustomExpense)
                  }
                  placeholder={formatNumber(selectedCity.minLivingCost)}
                  className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 錯誤提示 */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* 提交 */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-white text-lg font-bold rounded-xl shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-[var(--color-accent)]/40 transition-shadow"
        >
          開始躺平
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-gray-600 text-center max-w-md"
      >
        數據來源：主計總處、衛福部、勞動部、央行、健保署、勞保局
        <br />
        通膨率 1.7%（114年CPI）・定存利率 1.7%（台銀牌告）・社保 2,155/月
      </motion.p>
    </motion.div>
  )
}
