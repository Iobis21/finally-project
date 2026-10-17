import { useState } from 'react'
import Button from '../ui/Button/Button'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  message: string
  confirmLabel?: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

// დადასტურების შიგთავსი Modal-ისთვის (Modal-ს children-ად გადაეცემა)
function ConfirmDialog({
  message,
  confirmLabel = 'წაშლა',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function confirm() {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="confirm-dialog">
      <p>{message}</p>
      <div className="confirm-dialog__actions">
        <Button variant="secondary" onClick={onCancel}>
          გაუქმება
        </Button>
        <Button variant="danger" onClick={confirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}

export default ConfirmDialog
