import type { Money } from '@/types'
import { DEFAULT_CURRENCY } from './constants'

export function money(amount: number, currency: Money['currency'] = DEFAULT_CURRENCY): Money {
  return { amount, currency }
}

export function zeroMoney(currency: Money['currency'] = DEFAULT_CURRENCY): Money {
  return { amount: 0, currency }
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(
      `No se pueden sumar montos con monedas distintas: ${a.currency} y ${b.currency}`
    )
  }
  return { amount: a.amount + b.amount, currency: a.currency }
}

export function multiplyMoney(value: Money, factor: number): Money {
  return { amount: Math.round(value.amount * factor), currency: value.currency }
}

export function compareMoney(a: Money, b: Money): number {
  if (a.currency !== b.currency) {
    throw new Error(
      `No se pueden comparar montos con monedas distintas: ${a.currency} y ${b.currency}`
    )
  }
  return a.amount - b.amount
}

export function progressRatio(raised: Money, goal: Money): number {
  if (goal.amount <= 0) return 0
  return raised.amount / goal.amount
}

export function formatMoney(value: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.amount / 100)
}
