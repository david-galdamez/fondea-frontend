import { Download, FileText } from 'lucide-react'
import type { Campaign, DonationCertificate } from '@/types'
import { formatLongDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { MoneyDisplay } from '@/components/common/money-display'

interface CertificateItemProps {
  certificate: DonationCertificate
  campaign?: Pick<Campaign, 'slug' | 'title'> | null
}

export function CertificateItem({ certificate, campaign }: CertificateItemProps) {
  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
      <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-md">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium">{campaign?.title ?? 'Campaña eliminada'}</p>
        <p className="text-muted-foreground text-xs">
          Emitido el {formatLongDate(certificate.issuedAt)} · Año fiscal {certificate.taxYear}
        </p>
      </div>
      <MoneyDisplay value={certificate.amount} className="hidden text-sm font-medium sm:inline" />
      <Button
        render={
          <a href={certificate.pdfUrl} target="_blank" rel="noreferrer">
            <Download className="size-4" />
            Descargar
          </a>
        }
        variant="outline"
        size="sm"
      />
    </div>
  )
}
