import type { Notification } from '@/types'

export const SEED_NOTIFICATIONS: readonly Notification[] = [
  {
    id: 'ntf-1',
    userId: 'usr-backer-1',
    type: 'campaign_near_goal',
    title: 'Una campaña que apoyas está cerca de su meta',
    body: '"Lámpara modular eco-friendly" lleva el 82% de su meta. Faltan 10 días.',
    entityRef: { type: 'campaign', id: 'cmp-1' },
    read: false,
    createdAt: '2026-05-12T09:00:00.000Z',
  },
  {
    id: 'ntf-2',
    userId: 'usr-backer-1',
    type: 'pledge_charged',
    title: 'Tu pledge fue cobrado',
    body: 'La campaña "Mural comunitario Barrio Azul" alcanzó su meta y se procesó tu pledge.',
    entityRef: { type: 'pledge', id: 'pld-3' },
    read: true,
    createdAt: '2026-04-30T20:05:00.000Z',
  },
  {
    id: 'ntf-3',
    userId: 'usr-creator-1',
    type: 'campaign_approved',
    title: 'Tu campaña fue aprobada',
    body: '"Lámpara modular eco-friendly" pasó la revisión y ya está activa.',
    entityRef: { type: 'campaign', id: 'cmp-1' },
    read: true,
    createdAt: '2026-04-25T11:00:00.000Z',
  },
] as const
