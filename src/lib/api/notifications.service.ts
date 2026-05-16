import type { ID, Notification, Paginated } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { paginate, simulateNetwork } from './client'
import { NotFoundError } from './errors'
import { notificationsStore } from './_stores'

export interface ListNotificationsOptions {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

export const notificationsService = {
  async listForUser(
    userId: ID,
    options: ListNotificationsOptions = {}
  ): Promise<Paginated<Notification>> {
    await simulateNetwork()
    const items = notificationsStore
      .filter((n) => n.userId === userId && (!options.unreadOnly || !n.read))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return paginate(items, options.page ?? 1, options.pageSize ?? DEFAULT_PAGE_SIZE)
  },

  async countUnread(userId: ID): Promise<number> {
    await simulateNetwork()
    return notificationsStore.filter((n) => n.userId === userId && !n.read).length
  },

  async markRead(id: ID): Promise<Notification> {
    await simulateNetwork()
    const updated = notificationsStore.update(id, { read: true })
    if (!updated) throw new NotFoundError('Notificación')
    return updated
  },

  async markAllRead(userId: ID): Promise<void> {
    await simulateNetwork()
    notificationsStore
      .filter((n) => n.userId === userId && !n.read)
      .forEach((n) => notificationsStore.update(n.id, { read: true }))
  },
}
