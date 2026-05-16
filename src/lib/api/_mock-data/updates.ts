import type { CampaignUpdate } from '@/types'

export const SEED_UPDATES: readonly CampaignUpdate[] = [
  {
    id: 'upd-1',
    campaignId: 'cmp-1',
    title: '¡Llegamos al 80% de la meta!',
    body: 'Gracias a todos los patrocinadores. Ya estamos cerca de cerrar la primera tirada de moldes.',
    visibility: 'public',
    publishedAt: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 'upd-2',
    campaignId: 'cmp-1',
    title: 'Detalles del proceso de fabricación',
    body: 'Para nuestros patrocinadores: aquí va el cronograma detallado y fotos del taller.',
    visibility: 'backers_only',
    publishedAt: '2026-05-08T16:00:00.000Z',
  },
  {
    id: 'upd-3',
    campaignId: 'cmp-2',
    title: 'Mural terminado',
    body: '¡Lo logramos! El mural ya está listo y la inauguración será el próximo sábado.',
    visibility: 'public',
    publishedAt: '2026-05-12T20:00:00.000Z',
  },
] as const
