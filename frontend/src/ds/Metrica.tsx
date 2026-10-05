import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import s from './Metrica.module.css'

interface MetricaProps {
  rotulo: string
  valor: ReactNode
  /** Unidade menor ao lado do número: "%", "/ 10". */
  unidade?: ReactNode
  detalhe?: ReactNode
  icone?: ReactNode
  para?: string
  children?: ReactNode
}

/** Bloco de número-chave do painel. O número é o protagonista; o resto é contexto. */
export function Metrica({ rotulo, valor, unidade, detalhe, icone, para, children }: MetricaProps) {
  const conteudo = (
    <>
      <div className={s.topo}>
        <span className={s.rotulo}>
          {icone}
          {rotulo}
        </span>
        {para && <ArrowUpRight className={s.seta} aria-hidden />}
      </div>
      <div className={s.valor}>
        {valor}
        {unidade && <span className={s.unidade}>{unidade}</span>}
      </div>
      {detalhe && <div className={s.detalhe}>{detalhe}</div>}
      {children && <div className={s.extra}>{children}</div>}
    </>
  )
  return para ? (
    <Link to={para} className={s.metrica}>
      {conteudo}
    </Link>
  ) : (
    <div className={s.metrica}>{conteudo}</div>
  )
}
