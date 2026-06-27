import { api } from '../client'

export type UpdateVisibility = 'PUBLIC' | 'SPONSORS'

export interface CampaignUpdateDto {
  id: string
  title: string
  body: string
  createdAt: string
  visibility: UpdateVisibility
}

export interface CampaignUpdateCreatedDto {
  id: string
  title: string
  createdAt: string
  notificationSent: boolean
}

export interface CreateUpdateRequest {
  title: string
  body: string
  visibility: UpdateVisibility
}

export const campaignUpdatesService = {
  publish(campaignId: string, data: CreateUpdateRequest): Promise<CampaignUpdateCreatedDto> {
    return api.post<CampaignUpdateCreatedDto>(`/api/campaigns/${campaignId}/updates`, data)
  },

  list(campaignId: string): Promise<CampaignUpdateDto[]> {
    return api.get<CampaignUpdateDto[]>(`/api/campaigns/${campaignId}/updates`)
  },

  delete(campaignId: string, updateId: string) {
    return api.delete<undefined>(`/api/campaigns/${campaignId}/updates/${updateId}`)
  },
}
