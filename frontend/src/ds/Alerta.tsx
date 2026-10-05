import type { ReactNode } from 'react'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import s from './Alerta.module.css'

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
  return (
    <div role={tom === 'danger' ? 'alert' : 'status'} data-tom={tom} className={cn(s.alerta, className)}>
      <Icone className={s.icone} />
      <div className={s.texto}>
        <p className={s.titulo}>{titulo}</p>
        {children && <div className={s.corpo}>{children}</div>}
      </div>
      {acao && <div className={s.acao}>{acao}</div>}
    </div>
  )
}
