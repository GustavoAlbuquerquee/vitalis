import type { ReactNode } from 'react'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { tons } from './tons'

const icones = { ok: CircleCheck, info: Info, warn: TriangleAlert, danger: OctagonAlert }

interface AlertaProps {
  tom?: Extract<Tom, 'ok' | 'info' | 'warn' | 'danger'>
  titulo: ReactNode
  children?: ReactNode
  acao?: ReactNode
  className?: string
}

/** Mensagem em linha, presa ao contexto — usada para as regras de negócio (conflito, capacidade). */
export function Alerta({ tom = 'info', titulo, children, acao, className }: AlertaProps) {
  const Icone = icones[tom]
  const t = tons[tom]
  return (
    <div role={tom === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-card border-l-[3px] p-3.5', t.suave, t.borda, className)}>
      <Icone className={cn('mt-0.5 size-[18px] shrink-0', t.texto)} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-ink">{titulo}</p>
        {children && <div className="mt-0.5 text-ink-2">{children}</div>}
      </div>
      {acao && <div className="shrink-0 self-center">{acao}</div>}
    </div>
  )
}
