/*
 * As regras de negócio que a interface precisa conhecer para dar feedback antes do envio.
 * A fonte da verdade continua sendo o back-end (docs/regras-de-negocio.md);
 * aqui elas só servem para avisar o usuário cedo.
 */
import type { Consulta, Internacao, ProfissionalSaude, Quarto, SituacaoQuarto } from '@/tipos/dominio'
import { indiceDiaSemana, minutos, paraDate } from '@/lib/datas'
import { diasSemana } from '@/lib/rotulos'

export interface Intervalo {
  inicio: number
  fim: number
}

/** RN3 — dois intervalos conflitam quando cada um começa antes do outro terminar. Fim exclusivo. */
export function conflitaCom(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim
}

export function intervaloDaConsulta(c: Pick<Consulta, 'data' | 'horario' | 'duracaoMinutos'>): Intervalo {
  const inicio = paraDate(`${c.data}T${c.horario}`).getTime()
  return { inicio, fim: inicio + c.duracaoMinutos * 60_000 }
}

export function consultaOcupaAgenda(c: Consulta): boolean {
  return c.status === 'AGENDADA' || c.status === 'REALIZADA'
}

/** RF7 — o horário cabe em alguma janela de disponibilidade do profissional naquele dia da semana? */
export function cabeNaDisponibilidade(p: ProfissionalSaude, data: string, horario: string, duracao: number): boolean {
  const dia = diasSemana[indiceDiaSemana(data)].valor
  const ini = minutos(horario)
  return p.disponibilidades.some((j) => j.diaSemana === dia && minutos(j.horaInicio) <= ini && ini + duracao <= minutos(j.horaFim))
}

export function internacaoAtiva(i: Internacao): boolean {
  return i.status === 'ATIVA'
}

/** RN5 — ocupação é contada, nunca digitada. */
export function ocupacaoAtual(q: Quarto, internacoes: Internacao[]): number {
  return internacoes.filter((i) => i.quartoId === q.id && internacaoAtiva(i)).length
}

/** Situação derivada: bloqueio administrativo vence; senão, compara ocupação com capacidade. */
export function situacaoDoQuarto(q: Quarto, internacoes: Internacao[]): SituacaoQuarto {
  if (q.bloqueio) return q.bloqueio
  return ocupacaoAtual(q, internacoes) >= q.capacidadeMaxima ? 'OCUPADO' : 'DISPONIVEL'
}

export function estaDisponivel(q: Quarto, internacoes: Internacao[]): boolean {
  return situacaoDoQuarto(q, internacoes) === 'DISPONIVEL'
}
