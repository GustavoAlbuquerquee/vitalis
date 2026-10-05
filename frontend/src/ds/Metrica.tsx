import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface MetricaProps {
  rotulo: string
  valor: ReactNode
  detalhe?: ReactNode
  icone?: ReactNode
  para?: string
  children?: ReactNode
}

/** Bloco de número-chave do painel. O número é o protagonista; o resto é contexto. */
export function Metrica({ rotulo, valor, detalhe, icone, para, children }: MetricaProps) {
  const conteudo = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-ink-2 [&_svg]:size-4 [&_svg]:text-ink-3">
          {icone}
          {rotulo}
        </span>
        {para && <ArrowUpRight className="size-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] tabular">{valor}</div>
      {detalhe && <div className="mt-1 text-sm text-ink-3">{detalhe}</div>}
      {children && <div className="mt-4">{children}</div>}
    </>
  )
  const classes = 'group block rounded-card border border-line bg-surface p-5'
  return para ? (
    <Link to={para} className={cn(classes, 'transition-colors hover:border-line-strong')}>
      {conteudo}
    </Link>
  ) : (
    <div className={classes}>{conteudo}</div>
  )
}
