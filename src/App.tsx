import { useState, useEffect, Component, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import InputForm from './components/InputForm'
import ResultView from './components/ResultView'
import LoadingReveal from './components/LoadingReveal'
import { simulate, type SimulationResult } from './utils/simulator'
import { CITIES, MEDIAN_SALARY, type CityData } from './data/constants'

class ErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
          <p className="text-destructive mb-4">發生錯誤：{this.state.error}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); this.props.onError() }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl"
          >
            重新開始
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type AppState = 'input' | 'loading' | 'result'

function App() {
  const [state, setState] = useState<AppState>('input')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [city, setCity] = useState<CityData | null>(null)

  // Auto-calculate from URL params (e.g., ?s=87&m=0&c=0)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('s')
    if (!s) return
    const savings = parseInt(s, 10)
    if (!savings || savings <= 0) return
    const salary = parseInt(params.get('m') || '0', 10) || MEDIAN_SALARY
    const cityIdx = Math.min(parseInt(params.get('c') || '0', 10) || 0, CITIES.length - 1)
    const expense = parseInt(params.get('e') || '0', 10) || undefined
    const c = CITIES[cityIdx]
    const r = simulate({
      savings, monthlySalaryBeforeQuit: salary, city: c,
      monthlyExpenseOverride: expense,
    })
    setResult(r)
    setCity(c)
    setState('result')
    // Clean URL without reload
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const handleResult = (r: SimulationResult, c: CityData) => {
    setResult(r)
    setCity(c)
    setState('loading')
  }

  const handleRevealDone = () => {
    setState('result')
  }

  const handleReset = () => {
    setResult(null)
    setCity(null)
    setState('input')
  }

  return (
    <ErrorBoundary onError={handleReset}>
      <div className="min-h-screen relative">
        <AnimatePresence mode="wait">
          {state === 'input' && (
            <InputForm key="input" onResult={handleResult} />
          )}
          {state === 'loading' && result && city && (
            <LoadingReveal key="loading" result={result} city={city} onDone={handleRevealDone} />
          )}
          {state === 'result' && result && (
            <ResultView key="result" result={result} city={city!} onReset={handleReset} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
