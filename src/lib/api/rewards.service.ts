import type { ID, Reward } from '@/types'
import { generateId, simulateNetwork } from './client'
import { NotFoundError, ValidationError } from './errors'
import { rewardsStore } from './_stores'

export type RewardInput = Omit<Reward, 'id' | 'claimed'>

export const rewardsService = {
  async listByCampaign(campaignId: ID): Promise<Reward[]> {
    await simulateNetwork()
    return rewardsStore.filter((r) => r.campaignId === campaignId).sort((a, b) => a.order - b.order)
  },

  async getById(id: ID): Promise<Reward> {
    await simulateNetwork()
    const r = rewardsStore.findById(id)
    if (!r) throw new NotFoundError('Recompensa')
    return r
  },

  async create(input: RewardInput): Promise<Reward> {
    await simulateNetwork()
    if (!input.title.trim()) {
      throw new ValidationError('El título es obligatorio', { title: 'Requerido' })
    }
    if (input.minAmount.amount <= 0) {
      throw new ValidationError('El monto mínimo debe ser mayor a cero', { minAmount: 'Inválido' })
    }
    const reward: Reward = { ...input, id: generateId(), claimed: 0 }
    return rewardsStore.insert(reward)
  },

  async update(id: ID, patch: Partial<RewardInput>): Promise<Reward> {
    await simulateNetwork()
    const updated = rewardsStore.update(id, patch)
    if (!updated) throw new NotFoundError('Recompensa')
    return updated
  },

  async remove(id: ID): Promise<void> {
    await simulateNetwork()
    const ok = rewardsStore.remove(id)
    if (!ok) throw new NotFoundError('Recompensa')
  },
}
