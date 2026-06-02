import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold leading-none cursor-pointer transition duration-150 select-none whitespace-nowrap active:scale-[0.96] disabled:opacity-[0.38] disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-surface-3 text-text hover:bg-border-2',
        danger:    'bg-error text-white hover:bg-[#c53030]',
        ghost:     'border border-border-2 bg-transparent text-text-2 hover:bg-surface-2 hover:text-text',
      },
      size: {
        lg: 'w-full px-5 py-[15px] rounded-lg text-[16px]',
        md: 'px-[18px] py-[11px] rounded-md text-[15px]',
        sm: 'px-3 py-[7px] rounded-md text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { buttonVariants }
