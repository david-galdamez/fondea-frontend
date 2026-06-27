import type { ID, ISODateString, Money } from './common'

export interface DonationCertificate {
  id: ID
  pledgeId: ID
  campaignId: ID
  campaignTitle: string
  fiscalName: string
  fiscalId: string
  amount: Money
  taxYear: number
  pdfUrl: string
  issuedAt: ISODateString
}
