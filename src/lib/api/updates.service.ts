import type { CampaignUpdate, ID, UpdateVisibility } from '@/types'
import { generateId, nowISO, simulateNetwork } from './client'
import { NotFoundError, ValidationError } from './errors'
import { updatesStore } from './_stores'

export interface UpdateInput {
  title: string
  body: string
  visibility: UpdateVisibility
}

export const updatesService = {
  async listByCampaign(campaignId: ID, visibility?: UpdateVisibility): Promise<CampaignUpdate[]> {
    await simulateNetwork()
    return updatesStore
      .filter((u) => u.campaignId === campaignId && (!visibility || u.visibility === visibility))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  },

  async getById(id: ID): Promise<CampaignUpdate> {
    await simulateNetwork()
    const u = updatesStore.findById(id)
    if (!u) throw new NotFoundError('Actualización')
    return u
  },

  async create(campaignId: ID, input: UpdateInput): Promise<CampaignUpdate> {
    await simulateNetwork()
    if (!input.title.trim() || !input.body.trim()) {
      throw new ValidationError('Título y contenido son obligatorios')
    }
    const update: CampaignUpdate = {
      id: generateId(),
      campaignId,
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      publishedAt: nowISO(),
    }
    return updatesStore.insert(update)
  },

  async update(id: ID, patch: Partial<UpdateInput>): Promise<CampaignUpdate> {
    await simulateNetwork()
    const updated = updatesStore.update(id, patch)
    if (!updated) throw new NotFoundError('Actualización')
    return updated
  },

  async remove(id: ID): Promise<void> {
    await simulateNetwork()
    const ok = updatesStore.remove(id)
    if (!ok) throw new NotFoundError('Actualización')
  },
}
