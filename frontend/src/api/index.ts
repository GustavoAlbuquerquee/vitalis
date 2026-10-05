/*
 * Camada de acesso a dados do front.
 *
 * Hoje lê os dados de exemplo em memória. Cada função tem o nome e o formato
 * do endpoint correspondente em docs/api.md — quando o back-end existir,
 * troca-se o corpo por fetch('/api/v1/...') e as telas não mudam.
 */
import { consultas, internacoes, pacientes, profissionais, quartos, registros } from '@/dados/semente'
import type { Consulta, Internacao, Paciente, ProfissionalSaude, Quarto, RegistroClinico } from '@/tipos/dominio'
import { normalizar } from '@/lib/formato'
import { ocupacaoAtual, situacaoDoQuarto } from '@/dominio/regras'

const porId = <T extends { id: number }>(lista: T[], id: number) => lista.find((x) => x.id === id)

/* GET /pacientes · /pacientes/{id} */
export const listarPacientes = (busca = ''): Paciente[] => {
  const q = normalizar(busca.trim())
  const digitos = busca.replace(/\D/g, '')
  return pacientes
    .filter((p) => !q || normalizar(p.nome).includes(q) || (digitos.length >= 3 && p.cpf.includes(digitos)))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}
export const buscarPaciente = (id: number) => porId(pacientes, id)

/* GET /profissionais · /profissionais/{id} */
export const listarProfissionais = (): ProfissionalSaude[] =>
  [...profissionais].sort((a, b) => a.nome.replace(/^\S+\s/, '').localeCompare(b.nome.replace(/^\S+\s/, ''), 'pt-BR'))
export const buscarProfissional = (id: number) => porId(profissionais, id)

/* GET /consultas?profissionalId=&pacienteId=&data=&status= */
export function listarConsultas(filtro: Partial<Pick<Consulta, 'profissionalId' | 'pacienteId' | 'data' | 'status'>> = {}): Consulta[] {
  return consultas
    .filter(
      (c) =>
        (filtro.profissionalId === undefined || c.profissionalId === filtro.profissionalId) &&
        (filtro.pacienteId === undefined || c.pacienteId === filtro.pacienteId) &&
        (filtro.data === undefined || c.data === filtro.data) &&
        (filtro.status === undefined || c.status === filtro.status),
    )
    .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario))
}
export const buscarConsulta = (id: number) => porId(consultas, id)

/* GET /internacoes?status=&quartoId= */
export function listarInternacoes(filtro: Partial<Pick<Internacao, 'status' | 'quartoId' | 'pacienteId'>> = {}): Internacao[] {
  return internacoes
    .filter(
      (i) =>
        (filtro.status === undefined || i.status === filtro.status) &&
        (filtro.quartoId === undefined || i.quartoId === filtro.quartoId) &&
        (filtro.pacienteId === undefined || i.pacienteId === filtro.pacienteId),
    )
    .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada))
}
export const buscarInternacao = (id: number) => porId(internacoes, id)

/* GET /quartos · /quartos/{id}/ocupacao */
export interface QuartoComOcupacao extends Quarto {
  ocupacao: number
  vagas: number
  situacao: ReturnType<typeof situacaoDoQuarto>
}
export function listarQuartos(): QuartoComOcupacao[] {
  return quartos.map((q) => comOcupacao(q))
}
export function buscarQuarto(id: number): QuartoComOcupacao | undefined {
  const q = porId(quartos, id)
  return q && comOcupacao(q)
}
function comOcupacao(q: Quarto): QuartoComOcupacao {
  const ocupacao = ocupacaoAtual(q, internacoes)
  return { ...q, ocupacao, vagas: q.bloqueio ? 0 : q.capacidadeMaxima - ocupacao, situacao: situacaoDoQuarto(q, internacoes) }
}

/* GET /atendimentos/{id}/registros */
export function listarRegistros(atendimento: RegistroClinico['atendimento']): RegistroClinico[] {
  return registros
    .filter((r) => r.atendimento.tipo === atendimento.tipo && r.atendimento.id === atendimento.id)
    .sort((a, b) => a.dataRegistro.localeCompare(b.dataRegistro))
}

/* GET /pacientes/{id}/historico — derivado, nunca armazenado (RN6) */
export type EventoHistorico =
  | { tipo: 'consulta'; data: string; consulta: Consulta; registros: RegistroClinico[] }
  | { tipo: 'internacao'; data: string; internacao: Internacao; registros: RegistroClinico[] }

export function historicoDoPaciente(pacienteId: number): EventoHistorico[] {
  const eventos: EventoHistorico[] = [
    ...listarConsultas({ pacienteId }).map((consulta) => ({
      tipo: 'consulta' as const,
      data: `${consulta.data}T${consulta.horario}`,
      consulta,
      registros: listarRegistros({ tipo: 'consulta', id: consulta.id }),
    })),
    ...listarInternacoes({ pacienteId }).map((internacao) => ({
      tipo: 'internacao' as const,
      data: internacao.dataEntrada,
      internacao,
      registros: listarRegistros({ tipo: 'internacao', id: internacao.id }),
    })),
  ]
  return eventos.sort((a, b) => b.data.localeCompare(a.data))
}

export const internacaoAtivaDoPaciente = (pacienteId: number) =>
  internacoes.find((i) => i.pacienteId === pacienteId && i.status === 'ATIVA')

/** Todos os atendimentos que ocupam a agenda do profissional (RN3 cruza consulta e internação). */
export const consultasDoProfissional = (profissionalId: number) => consultas.filter((c) => c.profissionalId === profissionalId)
