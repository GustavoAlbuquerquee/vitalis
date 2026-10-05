import type { ReactNode } from 'react'
import type { Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import s from './Selo.module.css'

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
  return (
    <span data-tom={tom} className={cn(s.selo, compacto && s.compacto, className)}>
      {ponto && <span className={s.ponto} aria-hidden />}
      {children}
    </span>
  )
}

/** Etiqueta neutra, retangular, para metadados (tipo de quarto, especialidade). */
export function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(s.etiqueta, className)}>{children}</span>
}
