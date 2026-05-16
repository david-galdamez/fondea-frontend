import type { CreatePledgeInput, ID, Paginated, Pledge } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { addMoney, compareMoney } from '@/lib/money'
import { generateId, nowISO, paginate, simulateNetwork } from './client'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from './errors'
import { campaignsStore, pledgesStore, rewardsStore } from './_stores'

export const pledgesService = {
  async listByCampaign(
    campaignId: ID,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<Paginated<Pledge>> {
    await simulateNetwork()
    const items = pledgesStore
      .filter((p) => p.campaignId === campaignId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return paginate(items, page, pageSize)
  },

  async listByBacker(
    backerId: ID,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<Paginated<Pledge>> {
    await simulateNetwork()
    const items = pledgesStore
      .filter((p) => p.backerId === backerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return paginate(items, page, pageSize)
  },

  async getById(id: ID): Promise<Pledge> {
    await simulateNetwork()
    const p = pledgesStore.findById(id)
    if (!p) throw new NotFoundError('Pledge')
    return p
  },

  async create(backerId: ID, input: CreatePledgeInput): Promise<Pledge> {
    await simulateNetwork()
    const campaign = campaignsStore.findById(input.campaignId)
    if (!campaign) throw new NotFoundError('Campaña')
    if (campaign.status !== 'active') {
      throw new ForbiddenError('Solo puedes apoyar campañas activas')
    }
    if (input.amount.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a cero', { amount: 'Inválido' })
    }
    if (input.rewardId) {
      const reward = rewardsStore.findById(input.rewardId)
      if (!reward) throw new NotFoundError('Recompensa')
      if (reward.campaignId !== campaign.id) {
        throw new ValidationError('La recompensa no pertenece a esta campaña')
      }
      if (compareMoney(input.amount, reward.minAmount) < 0) {
        throw new ValidationError('El monto está por debajo del mínimo de la recompensa', {
          amount: 'Por debajo del mínimo',
        })
      }
      if (reward.stock !== undefined && reward.claimed >= reward.stock) {
        throw new ConflictError('Esta recompensa ya no tiene stock')
      }
      rewardsStore.update(reward.id, { claimed: reward.claimed + 1 })
    }

    const pledge: Pledge = {
      id: generateId(),
      campaignId: input.campaignId,
      backerId,
      rewardId: input.rewardId,
      amount: input.amount,
      status: 'authorized',
      isAnonymous: input.isAnonymous ?? false,
      wantsCertificate: input.wantsCertificate ?? false,
      createdAt: nowISO(),
    }
    pledgesStore.insert(pledge)

    campaignsStore.update(campaign.id, {
      raised: addMoney(campaign.raised, input.amount),
      backersCount: campaign.backersCount + 1,
      updatedAt: nowISO(),
    })

    return pledge
  },

  async cancel(id: ID, backerId: ID): Promise<Pledge> {
    await simulateNetwork()
    const existing = pledgesStore.findById(id)
    if (!existing) throw new NotFoundError('Pledge')
    if (existing.backerId !== backerId) {
      throw new ForbiddenError('No puedes cancelar este pledge')
    }
    if (existing.status !== 'authorized' && existing.status !== 'pending') {
      throw new ForbiddenError('Este pledge ya no se puede cancelar')
    }
    const updated = pledgesStore.update(id, { status: 'cancelled' })
    if (!updated) throw new NotFoundError('Pledge')

    const campaign = campaignsStore.findById(existing.campaignId)
    if (campaign) {
      campaignsStore.update(campaign.id, {
        raised: {
          ...campaign.raised,
          amount: Math.max(0, campaign.raised.amount - existing.amount.amount),
        },
        backersCount: Math.max(0, campaign.backersCount - 1),
        updatedAt: nowISO(),
      })
    }
    if (existing.rewardId) {
      const reward = rewardsStore.findById(existing.rewardId)
      if (reward) {
        rewardsStore.update(reward.id, { claimed: Math.max(0, reward.claimed - 1) })
      }
    }
    return updated
  },
}
