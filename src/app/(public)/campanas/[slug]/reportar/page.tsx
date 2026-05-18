import { ReportFraudForm } from '@/components/fraud/report-fraud-form'

export default async function ReportFraudPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ReportFraudForm slug={slug} />
    </div>
  )
}
