import type {
  DiaSemana,
  Especialidade,
  SituacaoQuarto,
  StatusConsulta,
  StatusInternacao,
  TipoQuarto,
  TipoRegistro,
} from '@/tipos/dominio'

/** Tom visual de um status. Mapeia direto para os tokens semânticos (ok, info, warn, danger, neutral, brand). */
export type Tom = 'brand' | 'ok' | 'info' | 'warn' | 'danger' | 'neutral'

export const especialidades: Record<Especialidade, { rotulo: string; conselho: string }> = {
  CLINICA_GERAL: { rotulo: 'Clínica geral', conselho: 'CRM' },
  CARDIOLOGIA: { rotulo: 'Cardiologia', conselho: 'CRM' },
  PEDIATRIA: { rotulo: 'Pediatria', conselho: 'CRM' },
  ORTOPEDIA: { rotulo: 'Ortopedia', conselho: 'CRM' },
  GINECOLOGIA: { rotulo: 'Ginecologia', conselho: 'CRM' },
  NEUROLOGIA: { rotulo: 'Neurologia', conselho: 'CRM' },
  ENFERMAGEM: { rotulo: 'Enfermagem', conselho: 'COREN' },
  FISIOTERAPIA: { rotulo: 'Fisioterapia', conselho: 'CREFITO' },
}

export const statusConsulta: Record<StatusConsulta, { rotulo: string; tom: Tom }> = {
  AGENDADA: { rotulo: 'Agendada', tom: 'info' },
  REALIZADA: { rotulo: 'Realizada', tom: 'ok' },
  CANCELADA: { rotulo: 'Cancelada', tom: 'danger' },
  NAO_COMPARECEU: { rotulo: 'Não compareceu', tom: 'neutral' },
}

export const statusInternacao: Record<StatusInternacao, { rotulo: string; tom: Tom }> = {
  ATIVA: { rotulo: 'Ativa', tom: 'brand' },
  ALTA_CONCEDIDA: { rotulo: 'Alta concedida', tom: 'ok' },
  TRANSFERIDA: { rotulo: 'Transferida', tom: 'neutral' },
  CANCELADA: { rotulo: 'Cancelada', tom: 'danger' },
}

export const situacaoQuarto: Record<SituacaoQuarto, { rotulo: string; tom: Tom }> = {
  DISPONIVEL: { rotulo: 'Disponível', tom: 'ok' },
  OCUPADO: { rotulo: 'Lotado', tom: 'danger' },
  MANUTENCAO: { rotulo: 'Manutenção', tom: 'warn' },
  INTERDITADO: { rotulo: 'Interditado', tom: 'neutral' },
}

export const tiposQuarto: Record<TipoQuarto, { rotulo: string; curto: string }> = {
  ENFERMARIA: { rotulo: 'Enfermaria', curto: 'ENF' },
  APARTAMENTO: { rotulo: 'Apartamento', curto: 'APT' },
  UTI: { rotulo: 'UTI', curto: 'UTI' },
  ISOLAMENTO: { rotulo: 'Isolamento', curto: 'ISO' },
}

export const tiposRegistro: Record<TipoRegistro, { rotulo: string; tom: Tom }> = {
  ANAMNESE: { rotulo: 'Anamnese', tom: 'neutral' },
  DIAGNOSTICO: { rotulo: 'Diagnóstico', tom: 'danger' },
  PRESCRICAO: { rotulo: 'Prescrição', tom: 'brand' },
  EXAME: { rotulo: 'Exame', tom: 'info' },
  EVOLUCAO: { rotulo: 'Evolução', tom: 'ok' },
}

export const diasSemana: { valor: DiaSemana; rotulo: string; curto: string }[] = [
  { valor: 'SEGUNDA', rotulo: 'Segunda', curto: 'Seg' },
  { valor: 'TERCA', rotulo: 'Terça', curto: 'Ter' },
  { valor: 'QUARTA', rotulo: 'Quarta', curto: 'Qua' },
  { valor: 'QUINTA', rotulo: 'Quinta', curto: 'Qui' },
  { valor: 'SEXTA', rotulo: 'Sexta', curto: 'Sex' },
  { valor: 'SABADO', rotulo: 'Sábado', curto: 'Sáb' },
  { valor: 'DOMINGO', rotulo: 'Domingo', curto: 'Dom' },
]

export const ufs = ['MG', 'SP', 'RJ', 'ES'] as const
