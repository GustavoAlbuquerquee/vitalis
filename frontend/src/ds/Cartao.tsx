import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import s from './Cartao.module.css'

export function Cartao({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.cartao, className)} {...props} />
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
    <div className={cn(s.cabecalho, className)}>
      <div className={s.cabecalhoTexto}>
        {icone && <span className={s.cabecalhoIcone}>{icone}</span>}
        <div>
          <h2 className={s.titulo}>{titulo}</h2>
          {descricao && <p className={s.descricao}>{descricao}</p>}
        </div>
      </div>
      {acoes && <div className={s.acoes}>{acoes}</div>}
    </div>
  )
}

export function CorpoCartao({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.corpo, className)} {...props} />
}
