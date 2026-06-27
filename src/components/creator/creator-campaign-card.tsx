import Link from 'next/link'
import {
  AlertTriangle,
  CalendarClock,
  ExternalLink,
  MessageSquare,
  Pencil,
  Users,
} from 'lucide-react'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { MyCampaignDto } from '@/lib/api/campaigns.service'
import { formatMoney, money } from '@/lib/money'

interface CreatorCampaignCardProps {
  campaign: MyCampaignDto
}

export function CreatorCampaignCard({ campaign }: CreatorCampaignCardProps) {
  const isEditable = campaign.status === 'DRAFT'
  const wasRejected = campaign.status === 'DRAFT' && !!campaign.rejectionReason
  const hasPublicPage =
    campaign.status === 'ACTIVE' || campaign.status === 'SUCCESSFUL' || campaign.status === 'FAILED'

  return (
    <article className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
      {wasRejected && (
        <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md px-3 py-2 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Campaña rechazada</p>
            <p>{campaign.rejectionReason}</p>
          </div>
        </div>
      )}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-base font-semibold">{campaign.title}</h3>
        </div>
        <StatusBadge status={campaign.status} />
      </header>

      <CampaignProgress
        raised={money(Math.round(campaign.totalPledged * 100))}
        goal={money(Math.round(campaign.goalAmount * 100))}
        backersCount={campaign.pledgeCount}
        size="sm"
      />

      {campaign.deadline && (
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <CalendarClock className="size-3" aria-hidden="true" />
          {campaign.status !== 'FAILED'
            ? `Cierra el ${formatShortDate(campaign.deadline)}`
            : `Cerró el ${formatShortDate(campaign.deadline)}`}
        </p>
      )}

      <footer className="flex flex-wrap items-center gap-2">
        {isEditable && (
          <Button
            render={<Link href={`/creador/campanas/${campaign.id}/editar`} />}
            variant="outline"
            size="sm"
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        )}
        <Button
          render={<Link href={`/creador/campanas/${campaign.id}/actualizaciones`} />}
          variant="outline"
          size="sm"
        >
          <MessageSquare className="size-4" />
          Actualizaciones
        </Button>
        <Button
          render={<Link href={`/creador/campanas/${campaign.id}/patrocinadores`} />}
          variant="ghost"
          size="sm"
        >
          <Users className="size-4" />
          Patrocinadores
        </Button>
        {hasPublicPage && (
          <Button
            render={<Link href={`/creador/campanas/${campaign.id}/preguntas`} />}
            variant="ghost"
            size="sm"
          >
            Preguntas
          </Button>
        )}
        {hasPublicPage && (
          <Button
            render={<Link href={`/campanas/${campaign.id}`} />}
            variant="ghost"
            size="sm"
            className="ml-auto"
          >
            <ExternalLink className="size-4" />
            Ver pública
          </Button>
        )}
        {campaign.status === 'SUCCESSFUL' && campaign.availableToWithdraw != null && (
          <p className="text-muted-foreground text-xs">
            Disponible para retirar:{' '}
            <span className="text-foreground font-medium">
              {formatMoney(money(Math.round(campaign.availableToWithdraw * 100)))}
            </span>
          </p>
        )}
      </footer>
    </article>
  )
}
