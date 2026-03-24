import { useState, useEffect, Component, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import InputForm from './components/InputForm'
import ResultView from './components/ResultView'
import LoadingReveal from './components/LoadingReveal'
import type { SimulationResult } from './utils/simulator'
import { CITIES, type CityData } from './data/constants'

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
  const [sharedView, setSharedView] = useState(false)
  const [sharedPersonalityId, setSharedPersonalityId] = useState<string | undefined>()
  const [sharedPercentile, setSharedPercentile] = useState<number | undefined>()

  // Restore shared result from URL (?r=base64)
  // Only contains public display data — no savings/salary
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('r')
    if (!encoded) return
    try {
      const data = JSON.parse(atob(encoded))
      const cityIdx = Math.min(data.c || 0, CITIES.length - 1)
      const c = CITIES[cityIdx]
      const r: SimulationResult = {
        totalDays: data.d ?? 0,
        totalMonths: Math.floor((data.d ?? 0) / 30.44),
        totalYears: (data.d ?? 0) / 365.25,
        timeline: [],
        finalBalance: 0,
        totalSpent: 0,
        totalInterestEarned: 0,
        initialSavings: 0,
        monthlyExpense: c.minLivingCost,
        capped: (data.d ?? 0) >= 36528,
      }
      setResult(r)
      setCity(c)
      setSharedView(true)
      if (data.p) setSharedPersonalityId(data.p)
      if (data.pct != null) setSharedPercentile(data.pct)
      setState('result')
    } catch { /* invalid param, ignore */ }
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
            <ResultView key="result" result={result} city={city!} sharedView={sharedView} sharedPersonalityId={sharedPersonalityId} sharedPercentile={sharedPercentile} onReset={handleReset} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
