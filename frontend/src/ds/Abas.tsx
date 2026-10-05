import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import s from './Abas.module.css'

interface Opcao<T extends string> {
  valor: T
  rotulo: ReactNode
  contagem?: number
}

interface AbasProps<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  aoMudar: (v: T) => void
  className?: string
  rotulo: string
}

/** Abas sublinhadas: trocam a seção de uma mesma página. */
export function Abas<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="tablist" aria-label={rotulo} className={cn(s.abas, className)}>
      {opcoes.map((o) => (
        <button key={o.valor} role="tab" aria-selected={o.valor === valor} onClick={() => aoMudar(o.valor)} className={s.aba}>
          {o.rotulo}
          {o.contagem !== undefined && <span className={s.contagem}>{o.contagem}</span>}
        </button>
      ))}
    </div>
  )
}

/** Controle segmentado: alterna modos de visualização (grade/lista). */
export function Segmentado<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="radiogroup" aria-label={rotulo} className={cn(s.segmentado, className)}>
      {opcoes.map((o) => (
        <button key={o.valor} role="radio" aria-checked={o.valor === valor} onClick={() => aoMudar(o.valor)} className={s.segmento}>
          {o.rotulo}
        </button>
      ))}
    </div>
  )
}

/** Filtro em pílula, para filtros rápidos de status. */
export function Pilulas<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="radiogroup" aria-label={rotulo} className={cn(s.pilulas, className)}>
      {opcoes.map((o) => (
        <button key={o.valor} role="radio" aria-checked={o.valor === valor} onClick={() => aoMudar(o.valor)} className={s.pilula}>
          {o.rotulo}
          {o.contagem !== undefined && <span className={s.pilulaContagem}>{o.contagem}</span>}
        </button>
      ))}
    </div>
  )
}
