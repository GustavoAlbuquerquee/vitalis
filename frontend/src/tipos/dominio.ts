/*
 * Tipos do domínio, espelhando docs/diagrama-de-classes.md.
 * Os nomes seguem o glossário: paciente, profissional da saúde, quarto, atendimento.
 */

export type UF = 'MG' | 'SP' | 'RJ' | 'ES'

export type Especialidade =
  | 'CLINICA_GERAL'
  | 'CARDIOLOGIA'
  | 'PEDIATRIA'
  | 'ORTOPEDIA'
  | 'GINECOLOGIA'
  | 'NEUROLOGIA'
  | 'ENFERMAGEM'
  | 'FISIOTERAPIA'

export type StatusConsulta = 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'NAO_COMPARECEU'
export type StatusInternacao = 'ATIVA' | 'ALTA_CONCEDIDA' | 'TRANSFERIDA' | 'CANCELADA'
export type SituacaoQuarto = 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO' | 'INTERDITADO'
export type TipoQuarto = 'ENFERMARIA' | 'APARTAMENTO' | 'UTI' | 'ISOLAMENTO'
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO'
export type TipoRegistro = 'ANAMNESE' | 'DIAGNOSTICO' | 'PRESCRICAO' | 'EXAME' | 'EVOLUCAO'

export interface Endereco {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: UF
  cep: string
}

interface Pessoa {
  id: number
  nome: string
  telefone: string
  email: string
  ativo: boolean
}

export interface Paciente extends Pessoa {
  cpf: string
  /** ISO yyyy-mm-dd */
  dataNascimento: string
  endereco: Endereco
}

export interface Disponibilidade {
  id: number
  diaSemana: DiaSemana
  /** HH:mm */
  horaInicio: string
  horaFim: string
}

export interface ProfissionalSaude extends Pessoa {
  registroProfissional: string
  especialidade: Especialidade
  disponibilidades: Disponibilidade[]
}

export interface Consulta {
  id: number
  pacienteId: number
  profissionalId: number
  /** ISO yyyy-mm-dd */
  data: string
  /** HH:mm */
  horario: string
  duracaoMinutos: number
  motivo: string
  observacoesMedicas?: string
  status: StatusConsulta
}

export interface Internacao {
  id: number
  pacienteId: number
  profissionalId: number
  quartoId: number
  /** ISO yyyy-mm-ddTHH:mm */
  dataEntrada: string
  /** ISO yyyy-mm-dd */
  dataPrevistaAlta: string
  dataEfetivaAlta?: string
  motivo: string
  observacoes?: string
  status: StatusInternacao
}

export interface Quarto {
  id: number
  numero: string
  andar: number
  capacidadeMaxima: number
  tipo: TipoQuarto
  /** Só MANUTENCAO e INTERDITADO são decisão administrativa; o resto é derivado da ocupação. */
  bloqueio?: Extract<SituacaoQuarto, 'MANUTENCAO' | 'INTERDITADO'>
}

export interface RegistroClinico {
  id: number
  atendimento: { tipo: 'consulta' | 'internacao'; id: number }
  autorId: number
  tipo: TipoRegistro
  descricao: string
  /** ISO yyyy-mm-ddTHH:mm */
  dataRegistro: string
}
