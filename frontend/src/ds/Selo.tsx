import type { ReactNode } from 'react'
import type { Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { tons } from './tons'

interface SeloProps {
  tom?: Tom
  children: ReactNode
  /** Mostra o ponto colorido à esquerda — padrão para status. */
  ponto?: boolean
  /** Versão compacta, para espaços apertados (blocos de quarto, grades). */
  compacto?: boolean
  className?: string
}

/** Rótulo curto de status ou categoria. Cor nunca é a única pista: o texto sempre diz o estado. */
export function Selo({ tom = 'neutral', ponto = true, compacto, children, className }: SeloProps) {
  const t = tons[tom]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap',
        compacto ? 'h-5 gap-1 px-1.5 text-2xs' : 'h-[22px] gap-1.5 px-2 text-xs',
        t.suave,
        t.texto,
        className,
      )}
    >
      {ponto && <span className={cn('shrink-0 rounded-full', compacto ? 'size-1' : 'size-1.5', t.ponto)} aria-hidden />}
      {children}
    </span>
  )
}

/** Etiqueta neutra, retangular, para metadados (tipo de quarto, especialidade). */
export function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-[22px] items-center rounded-[5px] border border-line bg-surface-2 px-1.5 text-xs font-medium text-ink-2', className)}>
      {children}
    </span>
  )
}
