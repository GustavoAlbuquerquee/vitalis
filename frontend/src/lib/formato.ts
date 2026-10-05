import { paraDate, diferencaEmDias, hoje } from './datas'

const dataLonga = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const diaMes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
const semana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
const semanaCurta = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export const formatarData = (iso: string) => dataCurta.format(paraDate(iso))
export const formatarDataLonga = (iso: string) => dataLonga.format(paraDate(iso))
export const formatarDiaMes = (iso: string) => diaMes.format(paraDate(iso)).replace('.', '')
export const diaDaSemana = (iso: string) => semana.format(paraDate(iso))
export const diaDaSemanaCurto = (iso: string) => semanaCurta.format(paraDate(iso)).replace('.', '')

export function formatarDataHora(iso: string): string {
  const [, hora] = iso.split('T')
  return `${formatarData(iso)} · ${hora}`
}

/** "hoje", "amanhã", "ontem", "em 3 dias", "há 5 dias" */
export function relativo(iso: string): string {
  const d = diferencaEmDias(hoje(), iso)
  if (d === 0) return 'hoje'
  if (d === 1) return 'amanhã'
  if (d === -1) return 'ontem'
  return d > 0 ? `em ${d} dias` : `há ${-d} dias`
}

export function formatarCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '').padEnd(11, ' ')
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`.trim()
}

/** CPF para exibição pública (LGPD): só os seis dígitos do meio aparecem — •••.456.789-•• */
export function mascararCpf(cpf: string): string {
  const f = formatarCpf(cpf)
  return `•••${f.slice(3, 11)}••`
}

export function formatarTelefone(tel: string): string {
  const d = tel.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel
}

export function formatarCep(cep: string): string {
  const d = cep.replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep
}

export function iniciais(nome: string): string {
  const partes = nome.replace(/^(Dra?\.|Enf\.|Ft\.)\s+/, '').split(' ').filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

export function plural(n: number, singular: string, pluralForma = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForma}`
}

/** Normaliza para busca: sem acento, minúsculo. */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/* Máscaras de digitação para os formulários */
export function mascaraCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function mascaraCep(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}
