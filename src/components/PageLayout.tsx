import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children:         React.ReactNode
  header?:          React.ReactNode
  footer:           React.ReactNode
  className?:       string
  contentClassName?: string
}

export function PageLayout({ header, footer, children, className, contentClassName }: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col h-[100dvh]', className)}>
      {header}
      <div className={cn('flex-1 overflow-y-auto p-4', contentClassName)}>
        {children}
      </div>
      <div className="pt-3 px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-border bg-bg flex-shrink-0">
        {footer}
      </div>
    </div>
  )
}
