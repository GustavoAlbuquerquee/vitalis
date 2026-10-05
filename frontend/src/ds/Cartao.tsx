import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Cartao({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-line bg-surface', className)} {...props} />
}

interface CabecalhoCartaoProps {
  titulo: ReactNode
  descricao?: ReactNode
  acoes?: ReactNode
  icone?: ReactNode
  className?: string
}

export function CabecalhoCartao({ titulo, descricao, acoes, icone, className }: CabecalhoCartaoProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-line px-5 py-3.5', className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icone && <span className="mt-0.5 text-ink-3 [&_svg]:size-4">{icone}</span>}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{titulo}</h2>
          {descricao && <p className="text-sm text-ink-3">{descricao}</p>}
        </div>
      </div>
      {acoes && <div className="flex shrink-0 items-center gap-2">{acoes}</div>}
    </div>
  )
}

export function CorpoCartao({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}
