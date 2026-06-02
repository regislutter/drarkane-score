import * as RadixDialog from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dialogBtn = cva(
  'inline-flex items-center justify-center gap-1.5 px-[18px] py-[11px] rounded-md text-[15px] font-semibold leading-none cursor-pointer transition duration-150 select-none whitespace-nowrap active:scale-[0.96] disabled:opacity-[0.38] disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-surface-3 text-text hover:bg-border-2',
        danger:    'bg-error text-white hover:bg-[#c53030]',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  confirmDisabled?: boolean
}

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel    = 'Confirmer',
  cancelLabel     = 'Annuler',
  danger          = false,
  confirmDisabled = false,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[201] -translate-x-1/2 -translate-y-1/2',
            'bg-surface border border-border-2 rounded-xl p-6',
            'w-[calc(100%-40px)] max-w-[400px]',
            'shadow-[0_12px_48px_rgba(0,0,0,0.6)]',
            'max-h-[80dvh] flex flex-col',
          )}
          onPointerDownOutside={() => { if (onCancel) onCancel() }}
          onEscapeKeyDown={() => { if (onCancel) onCancel() }}
        >
          {title && (
            <RadixDialog.Title className="text-[18px] font-bold text-text mb-3">
              {title}
            </RadixDialog.Title>
          )}
          <RadixDialog.Description asChild>
            {children ? (
              <div className="text-text-2 text-[15px] leading-relaxed mb-5 overflow-y-auto flex-1">
                {children}
              </div>
            ) : (
              <span className="sr-only">{title}</span>
            )}
          </RadixDialog.Description>
          <div className="flex gap-2 justify-end flex-shrink-0">
            {onCancel && (
              <button
                className={dialogBtn({ variant: 'secondary' })}
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                className={dialogBtn({ variant: danger ? 'danger' : 'primary' })}
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
