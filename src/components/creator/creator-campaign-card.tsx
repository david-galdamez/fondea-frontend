import Link from 'next/link'
import { CalendarClock, ExternalLink, MessageSquare, Pencil, Users } from 'lucide-react'
import type { Campaign } from '@/types'
import { formatShortDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/campaigns/status-badge'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'

interface CreatorCampaignCardProps {
  campaign: Campaign
}

export function CreatorCampaignCard({ campaign }: CreatorCampaignCardProps) {
  const isEditable = campaign.status === 'draft' || campaign.status === 'rejected'
  const hasPublicPage =
    campaign.status === 'active' ||
    campaign.status === 'successful' ||
    campaign.status === 'failed'

  return (
    <article className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-base font-semibold">{campaign.title}</h3>
          <p className="text-muted-foreground line-clamp-1 text-sm">{campaign.summary}</p>
          {campaign.rejectionReason && (
            <p className="text-destructive mt-1 text-xs">
              Motivo de rechazo: {campaign.rejectionReason}
            </p>
          )}
        </div>
        <StatusBadge status={campaign.status} />
      </header>

      <CampaignProgress
        raised={campaign.raised}
        goal={campaign.goal}
        backersCount={campaign.backersCount}
        size="sm"
      />

      {campaign.endDate && (
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <CalendarClock className="size-3" aria-hidden="true" />
          {campaign.status === 'active'
            ? `Cierra el ${formatShortDate(campaign.endDate)}`
            : `Cerró el ${formatShortDate(campaign.endDate)}`}
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
        <Button
          render={<Link href={`/creador/campanas/${campaign.id}/preguntas`} />}
          variant="ghost"
          size="sm"
        >
          Preguntas
        </Button>
        {hasPublicPage && (
          <Button
            render={<Link href={`/campanas/${campaign.slug}`} />}
            variant="ghost"
            size="sm"
            className="ml-auto"
          >
            <ExternalLink className="size-4" />
            Ver pública
          </Button>
        )}
      </footer>
    </article>
  )
}
