import type { ID, ISODateString, Money } from './common'

export interface DonationCertificate {
  id: ID
  pledgeId: ID
  backerId: ID
  campaignId: ID
  amount: Money
  taxYear: number
  pdfUrl: string
  issuedAt: ISODateString
}
