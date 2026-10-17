import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode // შიგთავსი ნებისმიერია — ფორმა, დადასტურება... (Open/Closed)
}

function Modal({ isOpen, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // onClose ref-ში — რომ ეფექტი მხოლოდ გახსნა/დახურვისას გაეშვას და არა ყოველ რენდერზე
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    // ფოკუსი მოდალში გადადის, დახურვისას — უკან ღილაკზე
    const lastFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      lastFocused?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Portal: მოდალი იხატება <body>-ში და არა იქ, სადაც კომპონენტი დგას
  return createPortal(
    <div className="modal__overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()} // შიგნით დაჭერა მოდალს არ ხურავს
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="დახურვა">
            <X size={20} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
