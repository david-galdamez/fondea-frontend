import type {
  Campaign,
  Category,
  CampaignUpdate,
  DonationCertificate,
  FAQ,
  FraudReport,
  Notification,
  Pledge,
  Reward,
  User,
  Withdrawal,
} from '@/types'
import { MockStore } from './client'
import {
  SEED_CAMPAIGNS,
  SEED_CATEGORIES,
  SEED_CERTIFICATES,
  SEED_FAQS,
  SEED_FRAUD_REPORTS,
  SEED_NOTIFICATIONS,
  SEED_PLEDGES,
  SEED_REWARDS,
  SEED_UPDATES,
  SEED_USERS,
  SEED_WITHDRAWALS,
} from './_mock-data'

export const usersStore = new MockStore<User>('users', SEED_USERS)
export const categoriesStore = new MockStore<Category>('categories', SEED_CATEGORIES)
export const campaignsStore = new MockStore<Campaign>('campaigns', SEED_CAMPAIGNS)
export const rewardsStore = new MockStore<Reward>('rewards', SEED_REWARDS)
export const pledgesStore = new MockStore<Pledge>('pledges', SEED_PLEDGES)
export const updatesStore = new MockStore<CampaignUpdate>('updates', SEED_UPDATES)
export const faqsStore = new MockStore<FAQ>('faqs', SEED_FAQS)
export const notificationsStore = new MockStore<Notification>('notifications', SEED_NOTIFICATIONS)
export const fraudReportsStore = new MockStore<FraudReport>('fraud-reports', SEED_FRAUD_REPORTS)
export const withdrawalsStore = new MockStore<Withdrawal>('withdrawals', SEED_WITHDRAWALS)
export const certificatesStore = new MockStore<DonationCertificate>(
  'certificates',
  SEED_CERTIFICATES
)

export function resetAllStores(): void {
  usersStore.reset()
  categoriesStore.reset()
  campaignsStore.reset()
  rewardsStore.reset()
  pledgesStore.reset()
  updatesStore.reset()
  faqsStore.reset()
  notificationsStore.reset()
  fraudReportsStore.reset()
  withdrawalsStore.reset()
  certificatesStore.reset()
}
