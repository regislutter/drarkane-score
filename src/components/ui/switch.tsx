import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  'aria-label'?: string
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  'aria-label': ariaLabel,
  className,
}: SwitchProps) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'relative w-[50px] h-[28px] rounded-[14px] border-[1.5px] cursor-pointer transition-[background-color,border-color] duration-200 flex-shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        'data-[state=unchecked]:bg-surface-3 data-[state=unchecked]:border-border-2',
        className
      )}
    >
      <RadixSwitch.Thumb
        className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full transition-[transform,background-color] duration-200 data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-white data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-text-muted"
      />
    </RadixSwitch.Root>
  )
}
