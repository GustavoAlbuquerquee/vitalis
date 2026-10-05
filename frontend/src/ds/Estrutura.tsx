import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import s from './Estrutura.module.css'

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
    <header className={cn(s.cabecalho, className)}>
      {migalhas && (
        <nav aria-label="Caminho" className={s.migalhas}>
          {migalhas.map((m, i) => (
            <span key={i} className={s.migalha}>
              {i > 0 && <ChevronRight aria-hidden />}
              {m.para ? (
                <Link to={m.para}>{m.rotulo}</Link>
              ) : (
                <span className={s.migalhaAtual} aria-current="page">
                  {m.rotulo}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className={s.linha}>
        <div className={s.identidade}>
          {antes}
          <div className={s.textos}>
            <h1 className={s.titulo}>{titulo}</h1>
            {descricao && <div className={s.descricao}>{descricao}</div>}
          </div>
        </div>
        {acoes && <div className={s.acoes}>{acoes}</div>}
      </div>
    </header>
  )
}

interface PaginaProps {
  children: ReactNode
  className?: string
  /** Largura de formulário (896px). */
  estreita?: boolean
  /** Sem largura máxima — para a grade da agenda. */
  larga?: boolean
}

export function Pagina({ children, className, estreita, larga }: PaginaProps) {
  return <div className={cn(s.pagina, estreita && s.estreita, larga && s.larga, className)}>{children}</div>
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
    <div className={cn(s.vazio, className)}>
      <div className={s.vazioIcone}>{icone}</div>
      <p className={s.vazioTitulo}>{titulo}</p>
      {descricao && <p className={s.vazioDescricao}>{descricao}</p>}
      {acao && <div className={s.vazioAcao}>{acao}</div>}
    </div>
  )
}

/** Pares rótulo/valor — ficha cadastral, detalhes de atendimento. */
export function ListaDefinicao({ itens, colunas = 2 }: { itens: { rotulo: string; valor: ReactNode; mono?: boolean }[]; colunas?: 1 | 2 | 3 }) {
  return (
    <dl className={cn(s.definicoes, colunas === 2 && s.col2, colunas === 3 && s.col3)}>
      {itens.map((i) => (
        <div key={i.rotulo} className={s.definicao}>
          <dt className={s.termo}>{i.rotulo}</dt>
          <dd className={cn(s.valor, i.mono && s.valorMono)}>{i.valor ?? <span className={s.semValor}>—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}
