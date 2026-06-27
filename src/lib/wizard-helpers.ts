import type { Money } from '@/types'
import { money } from './money'

export function dollarsToCents(input: string | number): number {
  const value = typeof input === 'string' ? Number(input) : input
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.round(value * 100)
}

export function dollarsToMoney(input: string | number): Money {
  return money(dollarsToCents(input))
}

export function centsToDollarsString(cents: number): string {
  return (cents / 100).toFixed(2)
}
