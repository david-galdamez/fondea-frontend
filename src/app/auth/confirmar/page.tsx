import { Suspense } from 'react'
import { VerifyForm } from '@/components/auth/verify-form'

export default function ConfirmAccountPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  )
}
