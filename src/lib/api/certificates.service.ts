import type { DonationCertificate, ID } from '@/types'
import { money } from '@/lib/money'
import { api } from '../client'

interface DonationCertificateDto {
  id: string
  pledgeId: string
  campaignId: string
  campaignTitle: string
  sponsorName: string
  sponsorEmail: string
  fiscalName: string
  fiscalId: string
  amount: number
  issuedAt: string
  pdfUrl: string
}

function mapCertificate(dto: DonationCertificateDto): DonationCertificate {
  return {
    id: dto.id,
    pledgeId: dto.pledgeId,
    campaignId: dto.campaignId,
    campaignTitle: dto.campaignTitle,
    fiscalName: dto.fiscalName,
    fiscalId: dto.fiscalId,
    amount: money(Math.round(dto.amount * 100)),
    taxYear: new Date(dto.issuedAt).getFullYear(),
    pdfUrl: dto.pdfUrl,
    issuedAt: dto.issuedAt,
  }
}

export const certificatesService = {
  async listMine(): Promise<DonationCertificate[]> {
    const dtos = await api.get<DonationCertificateDto[]>('/api/certificates/mine')
    return dtos.map(mapCertificate).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
  },

  async getById(id: ID): Promise<DonationCertificate> {
    const dto = await api.get<DonationCertificateDto>(`/api/certificates/${id}`)
    return mapCertificate(dto)
  },
}
