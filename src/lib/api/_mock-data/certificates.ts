import type { DonationCertificate } from '@/types'
import { money } from '@/lib/money'

export const SEED_CERTIFICATES: readonly DonationCertificate[] = [
  {
    id: 'cer-1',
    pledgeId: 'pld-3',
    backerId: 'usr-backer-1',
    campaignId: 'cmp-2',
    amount: money(25_00),
    taxYear: 2026,
    pdfUrl: '#mock-certificate-1.pdf',
    issuedAt: '2026-04-30T21:00:00.000Z',
  },
] as const
