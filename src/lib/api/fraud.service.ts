import type { CreateFraudReportInput, FraudReport, FraudReportStatus, ID, Paginated } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { generateId, nowISO, paginate, simulateNetwork } from './client'
import { NotFoundError, ValidationError } from './errors'
import { fraudReportsStore } from './_stores'

export const fraudService = {
  async report(reporterId: ID, input: CreateFraudReportInput): Promise<FraudReport> {
    await simulateNetwork()
    if (!input.details.trim()) {
      throw new ValidationError('Debes describir el motivo del reporte', { details: 'Requerido' })
    }
    const report: FraudReport = {
      id: generateId(),
      campaignId: input.campaignId,
      reporterId,
      reason: input.reason,
      details: input.details,
      status: 'open',
      createdAt: nowISO(),
    }
    return fraudReportsStore.insert(report)
  },

  async listByReporter(reporterId: ID): Promise<FraudReport[]> {
    await simulateNetwork()
    return fraudReportsStore
      .filter((r) => r.reporterId === reporterId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async listAll(
    status?: FraudReportStatus,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<Paginated<FraudReport>> {
    await simulateNetwork()
    const items = fraudReportsStore
      .filter((r) => !status || r.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return paginate(items, page, pageSize)
  },

  async getById(id: ID): Promise<FraudReport> {
    await simulateNetwork()
    const r = fraudReportsStore.findById(id)
    if (!r) throw new NotFoundError('Reporte de fraude')
    return r
  },

  async resolve(
    id: ID,
    status: Exclude<FraudReportStatus, 'open'>,
    notes?: string
  ): Promise<FraudReport> {
    await simulateNetwork()
    const updated = fraudReportsStore.update(id, {
      status,
      resolutionNotes: notes,
      resolvedAt: status === 'reviewing' ? undefined : nowISO(),
    })
    if (!updated) throw new NotFoundError('Reporte de fraude')
    return updated
  },
}
