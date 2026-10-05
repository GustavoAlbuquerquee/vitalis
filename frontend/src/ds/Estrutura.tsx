import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Migalha {
  rotulo: string
  para?: string
}

interface CabecalhoPaginaProps {
  titulo: ReactNode
  descricao?: ReactNode
  acoes?: ReactNode
  migalhas?: Migalha[]
  antes?: ReactNode
  className?: string
}

export function CabecalhoPagina({ titulo, descricao, acoes, migalhas, antes, className }: CabecalhoPaginaProps) {
  return (
    <header className={cn('mb-6', className)}>
      {migalhas && (
        <nav aria-label="Caminho" className="mb-3 flex flex-wrap items-center gap-1 text-sm text-ink-3">
          {migalhas.map((m, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
              {m.para ? (
                <Link to={m.para} className="hover:text-ink">
                  {m.rotulo}
                </Link>
              ) : (
                <span className="text-ink-2" aria-current="page">{m.rotulo}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {antes}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-[-0.015em] text-ink sm:text-2xl sm:tracking-[-0.02em]">{titulo}</h1>
            {descricao && <div className="mt-1 text-base text-ink-2">{descricao}</div>}
          </div>
        </div>
        {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </header>
  )
}

export function Pagina({ children, className, estreita }: { children: ReactNode; className?: string; estreita?: boolean }) {
  return <div className={cn('mx-auto w-full px-4 py-6 sm:px-8 sm:py-8', estreita ? 'max-w-4xl' : 'max-w-[1360px]', className)}>{children}</div>
}

interface EstadoVazioProps {
  icone: ReactNode
  titulo: string
  descricao?: ReactNode
  acao?: ReactNode
  className?: string
}

export function EstadoVazio({ icone, titulo, descricao, acao, className }: EstadoVazioProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-2 text-ink-3 [&_svg]:size-5">{icone}</div>
      <p className="text-base font-semibold">{titulo}</p>
      {descricao && <p className="mt-1 max-w-sm text-sm text-ink-3">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}

/** Pares rótulo/valor — ficha cadastral, detalhes de atendimento. */
export function ListaDefinicao({ itens, colunas = 2 }: { itens: { rotulo: string; valor: ReactNode; mono?: boolean }[]; colunas?: 1 | 2 | 3 }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', colunas === 2 && 'sm:grid-cols-2', colunas === 3 && 'sm:grid-cols-3')}>
      {itens.map((i) => (
        <div key={i.rotulo} className="min-w-0">
          <dt className="text-xs font-medium text-ink-3">{i.rotulo}</dt>
          <dd className={cn('mt-0.5 text-base text-ink break-words', i.mono && 'font-mono text-sm tabular')}>{i.valor ?? <span className="text-ink-3">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}
