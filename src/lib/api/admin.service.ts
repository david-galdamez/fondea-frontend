import { api, downloadFile } from '../client'
import type { CampaignStatus } from './campaigns.service'
import type { WithdrawalStatus } from './withdrawals.service'
import type { FraudReportStatus } from './fraud.service'

export interface CampaignReviewDto {
  id: string
  title: string
  description: string
  creatorId: string
  creatorName: string
  creatorEmail: string
  goalAmount: number
  isFlexibleGoal: boolean
  deadline: string
  categoryName: string
  locationCity: string
  submittedAt: string
  rejectionReason?: string
}

export interface CampaignStatusDto {
  id: string
  title: string
  status: CampaignStatus
}

export interface AdminWithdrawalDto {
  id: string
  campaignId: string
  campaignTitle: string
  grossAmount: number
  commissionAmount: number
  netAmount: number
  status: WithdrawalStatus
  requestedAt: string
  paidAt: string | null
}

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

export const adminService = {
  listAll() {
    return api.get<import('./campaigns.service').CampaignSummaryDto[]>('/api/admin/campaigns')
  },

  exportCampaignsCsv(): Promise<void> {
    return downloadFile('/api/export/campaigns/csv', 'campaigns.csv')
  },

  getPendingCampaigns(): Promise<CampaignReviewDto[]> {
    return api.get<CampaignReviewDto[]>('/api/admin/campaigns/pending')
  },

  approveCampaign(id: string) {
    return api.post<import('./campaigns.service').CampaignDetailDto>(
      `/api/admin/campaigns/${id}/approve`,
      {}
    )
  },

  rejectCampaign(id: string, rejectionReason?: string) {
    return api.post<import('./campaigns.service').CampaignDetailDto>(
      `/api/admin/campaigns/${id}/reject`,
      { rejectionReason }
    )
  },

  getPendingWithdrawals(): Promise<AdminWithdrawalDto[]> {
    return api.get<AdminWithdrawalDto[]>('/api/admin/withdrawals/pending')
  },

  approveWithdrawal(id: string): Promise<AdminWithdrawalDto> {
    return api.post<AdminWithdrawalDto>(`/api/admin/withdrawals/${id}/approve`, {})
  },

  rejectWithdrawal(id: string): Promise<AdminWithdrawalDto> {
    return api.post<AdminWithdrawalDto>(`/api/admin/withdrawals/${id}/reject`, {})
  },

  getPendingFraudReports(): Promise<FraudReportDto[]> {
    return api.get<FraudReportDto[]>('/api/admin/fraud-reports')
  },

  reviewFraudReport(id: string): Promise<FraudReportDto> {
    return api.post<FraudReportDto>(`/api/admin/fraud-reports/${id}/review`, {})
  },

  resolveFraudReport(id: string, resolutionNotes?: string): Promise<FraudReportDto> {
    return api.post<FraudReportDto>(`/api/admin/fraud-reports/${id}/resolve`, { resolutionNotes })
  },

  dismissFraudReport(id: string, resolutionNotes?: string): Promise<FraudReportDto> {
    return api.post<FraudReportDto>(`/api/admin/fraud-reports/${id}/dismiss`, { resolutionNotes })
  },
}
