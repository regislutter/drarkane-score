import { cva } from 'class-variance-authority'

const roundDot = cva('rounded-full border-2 transition-all duration-200', {
  variants: {
    state: {
      default: 'w-2.5 h-2.5 bg-surface-3 border-border-2',
      done:    'w-2.5 h-2.5 bg-primary/14 border-primary',
      active:  'w-3 h-3 bg-primary border-primary shadow-[0_0_8px_rgba(232,93,4,0.3)]',
    },
  },
  defaultVariants: { state: 'default' },
})

interface RoundIndicatorProps {
  current: number
}

export function RoundIndicator({ current }: RoundIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map(n => {
          const state = n === current ? 'active' : n < current ? 'done' : 'default'
          return <div key={n} className={roundDot({ state })} />
        })}
      </div>
      <span className="text-[14px] font-bold text-text-2 tracking-[0.04em]">Manche {current} / 3</span>
    </div>
  )
}
