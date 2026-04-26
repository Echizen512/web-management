import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  // Evitar que el fondo se mueva cuando el modal esté abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

  if (!open) return null

  // createPortal envía el modal fuera del Dashboard, directamente al body
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop (Fondo oscuro) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Contenido del Modal */}
      <div className="relative bg-background border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}