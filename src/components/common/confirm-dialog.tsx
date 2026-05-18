'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Variant = 'default' | 'destructive'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  confirming?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  confirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  async function handleConfirm() {
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" size="sm" disabled={confirming}>
                {cancelLabel}
              </Button>
            }
          />
          <Button
            type="button"
            size="sm"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            disabled={confirming}
            onClick={handleConfirm}
          >
            {confirming ? 'Procesando…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UseConfirmDialogReturn<T> {
  open: boolean
  target: T | null
  confirming: boolean
  ask: (target: T) => void
  close: () => void
  run: (handler: (target: T) => Promise<void> | void) => Promise<void>
}

export function useConfirmDialog<T = true>(): UseConfirmDialogReturn<T> {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<T | null>(null)
  const [confirming, setConfirming] = useState(false)

  function ask(value: T) {
    setTarget(value)
    setOpen(true)
  }

  function close() {
    if (confirming) return
    setOpen(false)
    setTarget(null)
  }

  async function run(handler: (target: T) => Promise<void> | void) {
    if (target === null) return
    setConfirming(true)
    try {
      await handler(target)
      setOpen(false)
      setTarget(null)
    } finally {
      setConfirming(false)
    }
  }

  return { open, target, confirming, ask, close, run }
}
