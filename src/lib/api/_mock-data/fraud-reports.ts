import type { FraudReport } from '@/types'

export const SEED_FRAUD_REPORTS: readonly FraudReport[] = [
  {
    id: 'frd-1',
    campaignId: 'cmp-4',
    reporterId: 'usr-backer-2',
    reason: 'misleading_info',
    details: 'Las imágenes parecen sacadas de un banco de fotos sin licencia.',
    status: 'open',
    createdAt: '2026-04-22T14:00:00.000Z',
  },
] as const
