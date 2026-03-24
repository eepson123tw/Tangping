import { describe, it, expect } from 'vitest'
import { getPersonality } from './personality'

describe('getPersonality', () => {
  it('returns 泡麵戰士 for very short duration (< 2 months)', () => {
    const p = getPersonality({
      totalDays: 30,
      savings: 100_000,
      monthlyExpense: 20000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('instant-noodle')
    expect(p.name).toBe('泡麵戰士')
  })

  it('returns 月光仙子 for low savings relative to expenses', () => {
    const p = getPersonality({
      totalDays: 90,
      savings: 50_000,
      monthlyExpense: 20000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('moonlight')
  })

  it('returns 躺平之神 for 10+ years', () => {
    const p = getPersonality({
      totalDays: 3700,
      savings: 5_000_000,
      monthlyExpense: 20000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('legend')
  })

  it('returns 躺平宗師 for 5-10 years', () => {
    const p = getPersonality({
      totalDays: 2200,
      savings: 3_000_000,
      monthlyExpense: 20000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('fire-master')
  })

  it('returns 隱居大師 for rural area + 2 years', () => {
    const p = getPersonality({
      totalDays: 900,
      savings: 500_000,
      monthlyExpense: 15500,
      cityName: '其他縣市',
      minLivingCost: 15515,
    })
    expect(p.id).toBe('hermit')
  })

  it('returns 及時行樂派 for high expense + short duration', () => {
    const p = getPersonality({
      totalDays: 400,
      savings: 500_000,
      monthlyExpense: 30000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('yolo')
  })

  it('returns 回巢青年 for expense far below city minimum', () => {
    const p = getPersonality({
      totalDays: 500,
      savings: 200_000,
      monthlyExpense: 10000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('parents-home')
  })

  it('returns 被動收入幻想家 for high savings + medium duration', () => {
    const p = getPersonality({
      totalDays: 1200,
      savings: 1_500_000,
      monthlyExpense: 20000,
      cityName: '台北市',
      minLivingCost: 20744,
    })
    expect(p.id).toBe('investor')
  })

  it('returns 極簡修行者 for expense below city min + 1yr+', () => {
    const p = getPersonality({
      totalDays: 600,
      savings: 300_000,
      monthlyExpense: 13000,
      cityName: '台南市',
      minLivingCost: 15515,
    })
    expect(p.id).toBe('frugal-monk')
  })

  it('always returns a personality (never undefined)', () => {
    const cases = [
      { totalDays: 0, savings: 0, monthlyExpense: 20000, cityName: '台北市', minLivingCost: 20744 },
      { totalDays: 365, savings: 500_000, monthlyExpense: 18000, cityName: '新北市', minLivingCost: 17750 },
      { totalDays: 200, savings: 300_000, monthlyExpense: 16000, cityName: '台中市', minLivingCost: 16431 },
    ]
    for (const c of cases) {
      const p = getPersonality(c)
      expect(p).toBeDefined()
      expect(p.name).toBeTruthy()
      expect(p.emoji).toBeTruthy()
    }
  })
})
