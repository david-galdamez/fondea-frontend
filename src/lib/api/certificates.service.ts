import type { DonationCertificate, ID } from '@/types'
import { simulateNetwork } from './client'
import { NotFoundError } from './errors'
import { certificatesStore } from './_stores'

export const certificatesService = {
  async listForBacker(backerId: ID, taxYear?: number): Promise<DonationCertificate[]> {
    await simulateNetwork()
    return certificatesStore
      .filter((c) => c.backerId === backerId && (taxYear === undefined || c.taxYear === taxYear))
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
  },

  async getById(id: ID): Promise<DonationCertificate> {
    await simulateNetwork()
    const c = certificatesStore.findById(id)
    if (!c) throw new NotFoundError('Certificado')
    return c
  },
}
