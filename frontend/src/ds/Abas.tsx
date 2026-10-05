import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

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

/** Abas sublinhadas: trocam a visão de uma mesma página. */
export function Abas<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="tablist" aria-label={rotulo} className={cn('flex gap-5 overflow-x-auto border-b border-line', className)}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="tab"
            aria-selected={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              '-mb-px flex h-10 items-center gap-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors',
              ativo ? 'border-brand text-ink' : 'border-transparent text-ink-3 hover:text-ink-2',
            )}
          >
            {o.rotulo}
            {o.contagem !== undefined && (
              <span className={cn('tabular rounded-full px-1.5 text-2xs', ativo ? 'bg-brand-soft text-brand-ink' : 'bg-surface-2 text-ink-3')}>
                {o.contagem}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Controle segmentado: alterna modos de visualização (dia/lista, grade/tabela). */
export function Segmentado<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="radiogroup" aria-label={rotulo} className={cn('inline-flex h-9 rounded-control border border-line bg-surface-2 p-0.5', className)}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              'flex items-center gap-1.5 rounded-[5px] px-3 text-sm font-medium transition-colors [&_svg]:size-3.5',
              ativo ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {o.rotulo}
          </button>
        )
      })}
    </div>
  )
}

/** Filtro em pílula, para filtros rápidos de status. */
export function Pilulas<T extends string>({ opcoes, valor, aoMudar, className, rotulo }: AbasProps<T>) {
  return (
    <div role="radiogroup" aria-label={rotulo} className={cn('flex flex-wrap gap-1.5', className)}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors',
              ativo ? 'border-ink bg-ink text-bg' : 'border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink',
            )}
          >
            {o.rotulo}
            {o.contagem !== undefined && <span className={cn('tabular text-xs', ativo ? 'opacity-70' : 'text-ink-3')}>{o.contagem}</span>}
          </button>
        )
      })}
    </div>
  )
}
