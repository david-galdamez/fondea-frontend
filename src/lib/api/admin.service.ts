import type { Campaign, CampaignStatus, ID, Paginated } from '@/types'
import { COMMISSION_RATE, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { nowISO, paginate, simulateNetwork } from './client'
import { ForbiddenError, NotFoundError } from './errors'
import { campaignsStore } from './_stores'

export const adminService = {
  async listPendingReview(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<Paginated<Campaign>> {
    await simulateNetwork()
    const items = campaignsStore
      .filter((c) => c.status === 'pending_review')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    return paginate(items, page, pageSize)
  },

  async listAll(
    filters: { status?: CampaignStatus; featured?: boolean } = {}
  ): Promise<Campaign[]> {
    await simulateNetwork()
    return campaignsStore.filter((c) => {
      if (filters.status && c.status !== filters.status) return false
      if (filters.featured !== undefined && c.featured !== filters.featured) return false
      return true
    })
  },

  async approveCampaign(id: ID): Promise<Campaign> {
    await simulateNetwork()
    const existing = campaignsStore.findById(id)
    if (!existing) throw new NotFoundError('Campaña')
    if (existing.status !== 'pending_review') {
      throw new ForbiddenError('Solo se pueden aprobar campañas en revisión')
    }
    const now = nowISO()
    const updated = campaignsStore.update(id, {
      status: 'active',
      approvedAt: now,
      updatedAt: now,
    })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },

  async rejectCampaign(id: ID, reason: string): Promise<Campaign> {
    await simulateNetwork()
    const updated = campaignsStore.update(id, {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: nowISO(),
    })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },

  async setFeatured(id: ID, featured: boolean): Promise<Campaign> {
    await simulateNetwork()
    const updated = campaignsStore.update(id, { featured, updatedAt: nowISO() })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },

  async getCommissionRate(): Promise<number> {
    await simulateNetwork()
    return COMMISSION_RATE
  },
}
