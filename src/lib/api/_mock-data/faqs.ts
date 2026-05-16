import type { FAQ } from '@/types'

export const SEED_FAQS: readonly FAQ[] = [
  {
    id: 'faq-1',
    campaignId: 'cmp-1',
    question: '¿Cuándo recibiré mi recompensa?',
    answer: 'Las recompensas se envían 60 días después del cierre exitoso de la campaña.',
    order: 0,
  },
  {
    id: 'faq-2',
    campaignId: 'cmp-1',
    question: '¿Envían internacionalmente?',
    answer: 'Sí, enviamos a toda Latinoamérica. El costo de envío se calcula al confirmar.',
    order: 1,
  },
  {
    id: 'faq-3',
    campaignId: 'cmp-3',
    question: '¿Qué pasa si no se alcanza la meta?',
    answer: 'Aplica el modelo "todo o nada": si no llegamos a la meta, no se cobra ningún pledge.',
    order: 0,
  },
] as const
