import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Fondea</h1>
      <p className="text-muted-foreground">Next.js + shadcn/ui project initialized successfully.</p>
      <Button>Get started</Button>
    </main>
  )
}
