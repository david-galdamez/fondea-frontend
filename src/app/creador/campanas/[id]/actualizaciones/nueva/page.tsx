import { NewUpdateForm } from '@/components/creator/updates/new-update-form'

export default async function NewUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewUpdateForm campaignId={id} />
}
