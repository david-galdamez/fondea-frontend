import { FAQsManager } from '@/components/creator/faqs/faqs-manager'

export default async function CampaignFAQsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FAQsManager campaignId={id} />
}
