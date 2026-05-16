import type {
  Campaign,
  CampaignDraft,
  CampaignSummary,
  ID,
  Paginated,
  SearchFilters,
} from '@/types'
import { DEFAULT_PAGE_SIZE, NEAR_GOAL_THRESHOLD } from '@/lib/constants'
import { progressRatio, zeroMoney } from '@/lib/money'
import { generateId, nowISO, paginate, simulateNetwork } from './client'
import { ForbiddenError, NotFoundError, ValidationError } from './errors'
import { campaignsStore } from './_stores'

function toSummary(campaign: Campaign): CampaignSummary {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    summary: campaign.summary,
    coverImageUrl: campaign.coverImageUrl,
    goal: campaign.goal,
    raised: campaign.raised,
    goalType: campaign.goalType,
    backersCount: campaign.backersCount,
    endDate: campaign.endDate,
    status: campaign.status,
    featured: campaign.featured,
    categoryId: campaign.categoryId,
    location: campaign.location,
    creatorId: campaign.creatorId,
  }
}

function matchesText(campaign: Campaign, query: string): boolean {
  const q = query.toLowerCase()
  return (
    campaign.title.toLowerCase().includes(q) ||
    campaign.summary.toLowerCase().includes(q) ||
    campaign.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

function applyFilters(items: Campaign[], filters: SearchFilters): Campaign[] {
  return items.filter((c) => {
    if (filters.query && !matchesText(c, filters.query)) return false
    if (filters.categoryId && c.categoryId !== filters.categoryId) return false
    if (filters.city && c.location.city !== filters.city) return false
    if (filters.country && c.location.country !== filters.country) return false
    if (filters.status && filters.status.length > 0 && !filters.status.includes(c.status))
      return false
    if (filters.goalType && c.goalType !== filters.goalType) return false
    return true
  })
}

function applySort(items: Campaign[], sortBy: SearchFilters['sortBy']): Campaign[] {
  const sorted = [...items]
  switch (sortBy) {
    case 'ending_soon':
      return sorted.sort((a, b) => a.endDate.localeCompare(b.endDate))
    case 'most_funded':
      return sorted.sort(
        (a, b) => progressRatio(b.raised, b.goal) - progressRatio(a.raised, a.goal)
      )
    case 'most_backers':
      return sorted.sort((a, b) => b.backersCount - a.backersCount)
    case 'featured':
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
    case 'recent':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

function isPublic(status: Campaign['status']): boolean {
  return status === 'active' || status === 'successful' || status === 'failed'
}

export const campaignsService = {
  async list(filters: SearchFilters = {}): Promise<Paginated<CampaignSummary>> {
    await simulateNetwork()
    const explicitStatus = filters.status && filters.status.length > 0
    const all = explicitStatus
      ? campaignsStore.all()
      : campaignsStore.filter((c) => isPublic(c.status))
    const filtered = applyFilters(all, filters)
    const sorted = applySort(filtered, filters.sortBy)
    const summaries = sorted.map(toSummary)
    return paginate(summaries, filters.page ?? 1, filters.pageSize ?? DEFAULT_PAGE_SIZE)
  },

  async getById(id: ID): Promise<Campaign> {
    await simulateNetwork()
    const c = campaignsStore.findById(id)
    if (!c) throw new NotFoundError('Campaña')
    return c
  },

  async getBySlug(slug: string): Promise<Campaign> {
    await simulateNetwork()
    const c = campaignsStore.find((x) => x.slug === slug)
    if (!c) throw new NotFoundError('Campaña')
    return c
  },

  async getFeatured(limit = 6): Promise<CampaignSummary[]> {
    await simulateNetwork()
    return campaignsStore
      .filter((c) => c.featured && isPublic(c.status))
      .slice(0, limit)
      .map(toSummary)
  },

  async getNearGoal(threshold = NEAR_GOAL_THRESHOLD): Promise<CampaignSummary[]> {
    await simulateNetwork()
    return campaignsStore
      .filter((c) => c.status === 'active' && progressRatio(c.raised, c.goal) >= threshold)
      .map(toSummary)
  },

  async getByCreator(creatorId: ID): Promise<Campaign[]> {
    await simulateNetwork()
    return campaignsStore.filter((c) => c.creatorId === creatorId)
  },

  async create(creatorId: ID, draft: CampaignDraft): Promise<Campaign> {
    await simulateNetwork()
    if (!draft.title.trim()) {
      throw new ValidationError('El título es obligatorio', { title: 'Requerido' })
    }
    if (draft.goal.amount <= 0) {
      throw new ValidationError('La meta debe ser mayor a cero', { goal: 'Inválida' })
    }
    const created: Campaign = {
      ...draft,
      id: generateId(),
      slug: '',
      creatorId,
      raised: zeroMoney(draft.goal.currency),
      backersCount: 0,
      status: 'draft',
      featured: false,
      startDate: '',
      endDate: '',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    return campaignsStore.insert(created)
  },

  async update(id: ID, patch: Partial<Campaign>): Promise<Campaign> {
    await simulateNetwork()
    const existing = campaignsStore.findById(id)
    if (!existing) throw new NotFoundError('Campaña')
    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      throw new ForbiddenError('Solo se pueden editar campañas en borrador o rechazadas')
    }
    const updated = campaignsStore.update(id, { ...patch, updatedAt: nowISO() })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },

  async submitForReview(id: ID): Promise<Campaign> {
    await simulateNetwork()
    const existing = campaignsStore.findById(id)
    if (!existing) throw new NotFoundError('Campaña')
    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      throw new ForbiddenError('Solo borradores o campañas rechazadas pueden enviarse a revisión')
    }
    const updated = campaignsStore.update(id, {
      status: 'pending_review',
      rejectionReason: undefined,
      updatedAt: nowISO(),
    })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },

  async cancel(id: ID): Promise<Campaign> {
    await simulateNetwork()
    const updated = campaignsStore.update(id, { status: 'cancelled', updatedAt: nowISO() })
    if (!updated) throw new NotFoundError('Campaña')
    return updated
  },
}
