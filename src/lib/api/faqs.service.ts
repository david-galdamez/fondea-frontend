import type { FAQ, ID } from '@/types'
import { generateId, simulateNetwork } from './client'
import { faqsStore } from './_stores'

export interface FAQInput {
  question: string
  answer: string
  order?: number
}

export const faqsService = {
  async listByCampaign(campaignId: ID): Promise<FAQ[]> {
    await simulateNetwork()
    return faqsStore.filter((f) => f.campaignId === campaignId).sort((a, b) => a.order - b.order)
  },

  async upsert(campaignId: ID, items: FAQInput[]): Promise<FAQ[]> {
    await simulateNetwork()
    faqsStore.filter((f) => f.campaignId === campaignId).forEach((f) => faqsStore.remove(f.id))
    const inserted: FAQ[] = items.map((item, idx) =>
      faqsStore.insert({
        id: generateId(),
        campaignId,
        question: item.question,
        answer: item.answer,
        order: item.order ?? idx,
      })
    )
    return inserted
  },
}
