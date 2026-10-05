/*
 * Componentes de domínio: peças do design system já vestidas com o vocabulário do hospital.
 * Usados por mais de um módulo — por isso moram fora de src/modulos.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Consulta, Internacao, ProfissionalSaude, RegistroClinico, SituacaoQuarto, StatusConsulta, StatusInternacao } from '@/tipos/dominio'
import { Avatar, Selo, tons } from '@/ds'
import { especialidades, situacaoQuarto, statusConsulta, statusInternacao, tiposRegistro } from '@/lib/rotulos'
import { formatarDataHora } from '@/lib/formato'
import { buscarProfissional } from '@/api'
import { cn } from '@/lib/cn'

export const SeloConsulta = ({ status }: { status: StatusConsulta }) => <Selo tom={statusConsulta[status].tom}>{statusConsulta[status].rotulo}</Selo>
export const SeloInternacao = ({ status }: { status: StatusInternacao }) => <Selo tom={statusInternacao[status].tom}>{statusInternacao[status].rotulo}</Selo>
export const SeloQuarto = ({ situacao }: { situacao: SituacaoQuarto }) => <Selo tom={situacaoQuarto[situacao].tom}>{situacaoQuarto[situacao].rotulo}</Selo>

interface PessoaProps {
  nome: string
  detalhe?: ReactNode
  para?: string
  tamanho?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Avatar + nome + uma linha de contexto. A forma padrão de mostrar uma pessoa em listas. */
export function Pessoa({ nome, detalhe, para, tamanho = 'md', className }: PessoaProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar nome={nome} tamanho={tamanho} />
      <div className="min-w-0 leading-tight">
        {para ? (
          <Link to={para} className="block truncate font-medium text-ink hover:underline hover:decoration-line-strong hover:underline-offset-4">
            {nome}
          </Link>
        ) : (
          <p className="truncate font-medium text-ink">{nome}</p>
        )}
        {detalhe && <div className="mt-0.5 truncate text-sm text-ink-3">{detalhe}</div>}
      </div>
    </div>
  )
}

export const nomeEspecialidade = (p: ProfissionalSaude) => especialidades[p.especialidade].rotulo

/** Linha do tempo dos registros clínicos de um atendimento. */
export function RegistrosClinicos({ registros, compacto }: { registros: RegistroClinico[]; compacto?: boolean }) {
  if (!registros.length) return <p className="text-sm text-ink-3">Nenhum registro clínico neste atendimento.</p>
  return (
    <ol className="relative flex flex-col gap-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-line">
      {registros.map((r) => {
        const t = tiposRegistro[r.tipo]
        const autor = buscarProfissional(r.autorId)
        return (
          <li key={r.id} className="relative pl-6">
            <span className={cn('absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-surface', tons[t.tom].ponto)} aria-hidden />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className={cn('font-semibold', tons[t.tom].texto)}>{t.rotulo}</span>
              <span className="text-ink-3 tabular">{formatarDataHora(r.dataRegistro)}</span>
              {!compacto && autor && <span className="text-ink-3">· {autor.nome}</span>}
            </div>
            <p className="mt-1 text-sm text-ink-2">{r.descricao}</p>
          </li>
        )
      })}
    </ol>
  )
}

/** Faixa de horário: "09:30 – 10:00". */
export function Horario({ c, className }: { c: Pick<Consulta, 'horario' | 'duracaoMinutos'>; className?: string }) {
  const [h, m] = c.horario.split(':').map(Number)
  const fim = h * 60 + m + c.duracaoMinutos
  return (
    <span className={cn('font-mono text-sm whitespace-nowrap tabular', className)}>
      {c.horario}
      <span className="text-ink-3"> – {String(Math.floor(fim / 60)).padStart(2, '0')}:{String(fim % 60).padStart(2, '0')}</span>
    </span>
  )
}

export const diasInternado = (i: Internacao, ate = new Date()) => {
  const entrada = new Date(i.dataEntrada)
  const fim = i.dataEfetivaAlta ? new Date(i.dataEfetivaAlta) : ate
  return Math.max(0, Math.floor((fim.getTime() - entrada.getTime()) / 86_400_000))
}
