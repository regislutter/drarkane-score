import { cva, type VariantProps } from 'class-variance-authority'

export const toggleBtn = cva(
  'rounded-md border-[1.5px] cursor-pointer transition duration-150 select-none disabled:opacity-35 disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true:  'border-primary bg-primary/14 text-primary font-semibold',
        false: 'border-border-2 bg-surface-2 text-text-2 font-medium hover:bg-surface-3 hover:text-text',
      },
      size: {
        md: 'py-[9px] px-4 text-[15px]',
        sm: 'py-1.5 px-3 text-[13px]',
      },
    },
    defaultVariants: { active: false, size: 'md' },
  }
)

export type ToggleBtnVariants = VariantProps<typeof toggleBtn>
