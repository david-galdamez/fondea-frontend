import { api } from '../client'

export type FraudReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED'

export type FraudReason =
  | 'misleading_info'
  | 'identity_theft'
  | 'inappropriate_content'
  | 'spam'
  | 'other'

export interface FraudReportDto {
  id: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  campaignId: string
  campaignTitle: string
  reason: string
  status: FraudReportStatus
  resolutionNotes?: string
  createdAt: string
  resolvedAt?: string
}

export interface CreateFraudReportRequest {
  campaignId: string
  reason: string
}

export const fraudService = {
  report(data: CreateFraudReportRequest): Promise<FraudReportDto> {
    return api.post<FraudReportDto>('/api/fraud-reports', data)
  },

  listAll(
    status?: FraudReportStatus,
    _page = 1,
    _pageSize = 100,
  ): Promise<FraudReportDto[]> {
    const query = status ? `?status=${status}` : ''
    return api.get<FraudReportDto[]>(`/api/admin/fraud-reports${query}`)
  },

  getById(id: string): Promise<FraudReportDto> {
    return api.get<FraudReportDto>(`/api/admin/fraud-reports/${id}`)
  },
}
