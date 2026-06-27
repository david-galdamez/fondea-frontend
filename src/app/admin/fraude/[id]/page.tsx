import { FraudReportDetail } from '@/components/admin/fraud-report-detail'

export default async function FraudReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FraudReportDetail reportId={id} />
}
