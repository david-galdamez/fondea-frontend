import type { ID, Money, Withdrawal, WithdrawalLimit } from '@/types'
import { COMMISSION_RATE, NEW_CREATOR_DAILY_WITHDRAWAL_LIMIT_CENTS } from '@/lib/constants'
import { addMoney, compareMoney, money, multiplyMoney, zeroMoney } from '@/lib/money'
import { generateId, nowISO, simulateNetwork } from './client'
import { ForbiddenError, NotFoundError, ValidationError } from './errors'
import { campaignsStore, usersStore, withdrawalsStore } from './_stores'

function startOfDayISO(d = new Date()): string {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy.toISOString()
}

export const withdrawalsService = {
  async getLimits(creatorId: ID): Promise<WithdrawalLimit> {
    await simulateNetwork()
    const user = usersStore.findById(creatorId)
    if (!user) throw new NotFoundError('Usuario')
    const isNew = user.isNewCreator ?? false
    const today = startOfDayISO()
    const usedToday = withdrawalsStore
      .filter((w) => w.creatorId === creatorId && w.requestedAt >= today)
      .reduce<Money>((acc, w) => addMoney(acc, w.net), zeroMoney())
    return {
      dailyMax: isNew
        ? money(NEW_CREATOR_DAILY_WITHDRAWAL_LIMIT_CENTS)
        : money(Number.MAX_SAFE_INTEGER),
      usedToday,
      isNewCreator: isNew,
    }
  },

  async listByCreator(creatorId: ID): Promise<Withdrawal[]> {
    await simulateNetwork()
    return withdrawalsStore
      .filter((w) => w.creatorId === creatorId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  },

  async request(creatorId: ID, campaignId: ID, gross: Money): Promise<Withdrawal> {
    await simulateNetwork()
    const campaign = campaignsStore.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campaña')
    if (campaign.creatorId !== creatorId) {
      throw new ForbiddenError('Esta campaña no te pertenece')
    }
    if (campaign.status !== 'successful') {
      throw new ForbiddenError('Solo puedes retirar fondos de campañas exitosas')
    }
    if (gross.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a cero')
    }
    if (compareMoney(gross, campaign.raised) > 0) {
      throw new ValidationError('No puedes retirar más de lo recaudado')
    }
    const commission = multiplyMoney(gross, COMMISSION_RATE)
    const net = { ...gross, amount: gross.amount - commission.amount }

    const limits = await withdrawalsService.getLimits(creatorId)
    if (limits.isNewCreator) {
      const projectedUsed = addMoney(limits.usedToday, net)
      if (compareMoney(projectedUsed, limits.dailyMax) > 0) {
        throw new ForbiddenError('Excede el límite diario para nuevos creadores')
      }
    }

    const withdrawal: Withdrawal = {
      id: generateId(),
      creatorId,
      campaignId,
      gross,
      commission,
      net,
      status: 'requested',
      requestedAt: nowISO(),
    }
    return withdrawalsStore.insert(withdrawal)
  },
}
