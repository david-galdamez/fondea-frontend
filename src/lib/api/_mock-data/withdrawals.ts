import type { Withdrawal } from '@/types'
import { money } from '@/lib/money'

export const SEED_WITHDRAWALS: readonly Withdrawal[] = [
  {
    id: 'wdr-1',
    creatorId: 'usr-creator-1',
    campaignId: 'cmp-2',
    gross: money(3_450_00),
    commission: money(172_50),
    net: money(3_277_50),
    status: 'paid',
    requestedAt: '2026-05-01T10:00:00.000Z',
    paidAt: '2026-05-03T16:00:00.000Z',
  },
] as const
