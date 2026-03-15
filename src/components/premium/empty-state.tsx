import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        'animate-in fade-in-50 duration-500',
        className
      )}
    >
      <div className="mb-6 rounded-full bg-muted p-6 ring-8 ring-muted/20 transition-all hover:scale-105 hover:ring-muted/30">
        <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          className="transition-all hover:scale-105 active:scale-95"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
