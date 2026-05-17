import type { ISODateString } from '@/types'

const longFormatter = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortFormatter = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatLongDate(iso: ISODateString): string {
  return longFormatter.format(new Date(iso))
}

export function formatShortDate(iso: ISODateString): string {
  return shortFormatter.format(new Date(iso))
}
