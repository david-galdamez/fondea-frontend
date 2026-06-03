import { api } from "../client";

export interface FaqDto {
  id: string
  question: string
  answer: string | null
  askedAt: string
  answeredAt: string | null
}

export interface FaqManageDto {
  id: string
  askedBy: string
  question: string
  answer: string | null
  askedAt: string
  answered: boolean
}

export interface AskQuestionRequest {
  question: string
}

export interface AnswerQuestionRequest {
  answer: string
}

export const faqsService = {
  ask(campaignId: string, data: AskQuestionRequest): Promise<FaqDto> {
    return api.post<FaqDto>(`/api/campaigns/${campaignId}/faqs`, data)
  },

  answer(campaignId: string, faqId: string, data: AnswerQuestionRequest): Promise<FaqDto> {
    return api.put<FaqDto>(`/api/campaigns/${campaignId}/faqs/${faqId}/answer`, data)
  },

  listPublic(campaignId: string): Promise<FaqDto[]> {
    return api.get<FaqDto[]>(`/api/campaigns/${campaignId}/faqs`)
  },

  listManage(campaignId: string): Promise<FaqManageDto[]> {
    return api.get<FaqManageDto[]>(`/api/campaigns/${campaignId}/faqs/manage`)
  },

  remove(campaignId: string, faqId: string): Promise<void> {
    return api.delete<void>(`/api/campaigns/${campaignId}/faqs/${faqId}`)
  },
}
