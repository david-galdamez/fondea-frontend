'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronLeft, Flag, HandHeart, Megaphone, MessageCircleQuestion } from 'lucide-react'
import type { Campaign, CampaignUpdate, Category, FAQ, Reward } from '@/types'
import {
  ApiError,
  campaignsService,
  categoriesService,
  faqsService,
  NotFoundError,
  rewardsService,
  updatesService,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CampaignProgress } from './campaign-progress'
import { CategoryBadge } from './category-badge'
import { CountdownTimer } from './countdown-timer'
import { LocationBadge } from './location-badge'
import { RewardCard } from './reward-card'
import { StatusBadge } from './status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'

interface CampaignDetailProps {
  slug: string
}

interface DetailData {
  campaign: Campaign
  category: Category | null
  rewards: Reward[]
  updates: CampaignUpdate[]
  faqs: FAQ[]
}

function CampaignDetailSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6 px-4 py-8"
      aria-hidden="true"
    >
      <div className="bg-muted h-72 w-full rounded-lg" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <div className="bg-muted h-8 w-2/3 rounded" />
          <div className="bg-muted h-4 w-full rounded" />
          <div className="bg-muted h-4 w-5/6 rounded" />
          <div className="bg-muted mt-6 h-40 w-full rounded" />
        </div>
        <div className="bg-muted h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function CampaignDetail({ slug }: CampaignDetailProps) {
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const campaign = await campaignsService.getBySlug(slug)
      const [category, rewards, updates, faqs] = await Promise.all([
        categoriesService
          .list()
          .then((all) => all.find((c) => c.id === campaign.categoryId) ?? null),
        rewardsService.listByCampaign(campaign.id),
        updatesService.listByCampaign(campaign.id, 'public'),
        faqsService.listByCampaign(campaign.id),
      ])
      return { campaign, category, rewards, updates, faqs }
    }

    load()
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Error desconocido'))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <CampaignDetailSkeleton />

  if (error instanceof NotFoundError) {
    notFound()
  }

  if (error) {
    const description = error instanceof ApiError ? error.message : undefined
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState description={description} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!data) return null

  const { campaign, category, rewards, updates, faqs } = data
  const canSupport = campaign.status === 'active'

  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Link
        href="/explorar"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Volver a explorar
      </Link>

      <header className="flex flex-col gap-4">
        {campaign.coverImageUrl && (
          <div className="bg-muted aspect-[16/9] w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.coverImageUrl}
              alt={`Portada de ${campaign.title}`}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={campaign.status} />
          {category && <CategoryBadge category={category} />}
          <LocationBadge location={campaign.location} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{campaign.title}</h1>
        <p className="text-muted-foreground text-lg">{campaign.summary}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="description-heading" className="flex flex-col gap-3">
            <h2 id="description-heading" className="text-xl font-semibold">
              Descripción
            </h2>
            <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {campaign.description || 'Sin descripción aún.'}
            </div>
          </section>

          {updates.length > 0 && (
            <section aria-labelledby="updates-heading" className="flex flex-col gap-3">
              <h2 id="updates-heading" className="text-xl font-semibold">
                Actualizaciones
              </h2>
              <ol className="flex flex-col gap-4">
                {updates.map((u) => (
                  <li
                    key={u.id}
                    className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4"
                  >
                    <p className="text-muted-foreground text-xs">
                      {new Date(u.publishedAt).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <h3 className="font-semibold">{u.title}</h3>
                    <p className="text-foreground/90 whitespace-pre-wrap">{u.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="faq-heading" className="flex flex-col gap-3">
            <h2 id="faq-heading" className="text-xl font-semibold">
              Preguntas frecuentes
            </h2>
            {faqs.length === 0 ? (
              <EmptyState
                icon={MessageCircleQuestion}
                title="Aún no hay preguntas frecuentes"
                description="El creador todavía no ha publicado FAQs para esta campaña."
              />
            ) : (
              <dl className="flex flex-col gap-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4"
                  >
                    <dt className="font-medium">{faq.question}</dt>
                    <dd className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
            <CampaignProgress
              raised={campaign.raised}
              goal={campaign.goal}
              backersCount={campaign.backersCount}
            />
            <CountdownTimer endDate={campaign.endDate} status={campaign.status} />
            <Button
              render={<Link href={`/campanas/${campaign.slug}/apoyar`} />}
              disabled={!canSupport}
              size="lg"
              className="w-full"
            >
              <HandHeart className="size-4" />
              {canSupport ? 'Apoyar esta campaña' : 'Campaña no disponible'}
            </Button>
            <Link
              href={`/campanas/${campaign.slug}/reportar`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 self-center text-xs"
            >
              <Flag className="size-3" />
              Reportar campaña
            </Link>
          </div>

          {rewards.length > 0 && (
            <section aria-labelledby="rewards-heading" className="flex flex-col gap-3">
              <h2 id="rewards-heading" className="text-sm font-semibold tracking-wide uppercase">
                <Megaphone className="mr-1 inline size-3" />
                Recompensas
              </h2>
              <div className="flex flex-col gap-3">
                {rewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
