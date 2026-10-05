/*
 * Componentes de domínio: peças do design system já vestidas com o vocabulário do hospital.
 * Usados por mais de um módulo — por isso moram fora de src/modulos.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Consulta, Internacao, ProfissionalSaude, RegistroClinico, SituacaoQuarto, StatusConsulta, StatusInternacao } from '@/tipos/dominio'
import { Avatar, Selo } from '@/ds'
import { especialidades, situacaoQuarto, statusConsulta, statusInternacao, tiposRegistro } from '@/lib/rotulos'
import { formatarDataHora } from '@/lib/formato'
import { buscarProfissional } from '@/api'
import { cn } from '@/lib/cn'
import s from './dominio.module.css'

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
    <div className={cn(s.pessoa, className)}>
      <Avatar nome={nome} tamanho={tamanho} />
      <div className={s.pessoaTexto}>
        {para ? (
          <Link to={para} className={s.pessoaNome}>
            {nome}
          </Link>
        ) : (
          <p className={s.pessoaNome}>{nome}</p>
        )}
        {detalhe && <div className={s.pessoaDetalhe}>{detalhe}</div>}
      </div>
    </div>
  )
}

export const nomeEspecialidade = (p: ProfissionalSaude) => especialidades[p.especialidade].rotulo

/** Linha do tempo dos registros clínicos de um atendimento. */
export function RegistrosClinicos({ registros, compacto }: { registros: RegistroClinico[]; compacto?: boolean }) {
  if (!registros.length) return <p className={s.semRegistros}>Nenhum registro clínico neste atendimento.</p>
  return (
    <ol className={s.registros}>
      {registros.map((r) => {
        const t = tiposRegistro[r.tipo]
        const autor = buscarProfissional(r.autorId)
        return (
          <li key={r.id} data-tom={t.tom} className={s.registro}>
            <span className={s.registroPonto} aria-hidden />
            <div className={s.registroMeta}>
              <span className={s.registroTipo}>{t.rotulo}</span>
              <span className="tabular">{formatarDataHora(r.dataRegistro)}</span>
              {!compacto && autor && <span>· {autor.nome}</span>}
            </div>
            <p className={s.registroTexto}>{r.descricao}</p>
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
    <span className={cn(s.horario, className)}>
      {c.horario}
      <span className={s.horarioFim}>
        {' '}
        – {String(Math.floor(fim / 60)).padStart(2, '0')}:{String(fim % 60).padStart(2, '0')}
      </span>
    </span>
  )
}

export const diasInternado = (i: Internacao, ate = new Date()) => {
  const entrada = new Date(i.dataEntrada)
  const fim = i.dataEfetivaAlta ? new Date(i.dataEfetivaAlta) : ate
  return Math.max(0, Math.floor((fim.getTime() - entrada.getTime()) / 86_400_000))
}
