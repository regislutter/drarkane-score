import * as RadixToggleGroup from '@radix-ui/react-toggle-group'
import { type VariantProps } from 'class-variance-authority'
import { toggleBtn } from '@/utils/variants'
import { cn } from '@/lib/utils'

// ── Root ──────────────────────────────────────────────────────────────────────

interface ToggleGroupProps {
  type: 'single'
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function ToggleGroup({ value, onValueChange, className, children }: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(val) => {
        // Guard against empty string emitted when user clicks the already-active item
        if (val !== '') onValueChange(val)
      }}
      className={cn('flex gap-1.5 flex-wrap', className)}
    >
      {children}
    </RadixToggleGroup.Root>
  )
}

// ── Item ──────────────────────────────────────────────────────────────────────

interface ToggleGroupItemProps extends VariantProps<typeof toggleBtn> {
  value: string
  disabled?: boolean
  'aria-label'?: string
  className?: string
  children: React.ReactNode
}

export function ToggleGroupItem({
  value,
  disabled,
  'aria-label': ariaLabel,
  className,
  size,
  children,
}: ToggleGroupItemProps) {
  return (
    <RadixToggleGroup.Item
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Base + inactive styles from CVA (active: false)
        toggleBtn({ active: false, size }),
        // Override active state using Radix data-[state=on] attribute
        'data-[state=on]:border-primary data-[state=on]:bg-primary/14 data-[state=on]:text-primary data-[state=on]:font-semibold',
        className
      )}
    >
      {children}
    </RadixToggleGroup.Item>
  )
}
