/*
 * Datas sem fuso: o domínio trabalha com data (yyyy-mm-dd) e hora (HH:mm) locais.
 * Os dados de exemplo são gerados relativos a "hoje" para a interface nunca parecer velha.
 */

const pad = (n: number) => String(n).padStart(2, '0')

export function isoData(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function hoje(): string {
  return isoData(new Date())
}

export function somarDias(iso: string, dias: number): string {
  const d = paraDate(iso)
  d.setDate(d.getDate() + dias)
  return isoData(d)
}

/** Converte yyyy-mm-dd (ou yyyy-mm-ddTHH:mm) em Date local. */
export function paraDate(iso: string): Date {
  const [data, hora = '00:00'] = iso.split('T')
  const [a, m, d] = data.split('-').map(Number)
  const [h, min] = hora.split(':').map(Number)
  return new Date(a, m - 1, d, h, min)
}

export function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function hhmm(totalMinutos: number): string {
  return `${pad(Math.floor(totalMinutos / 60))}:${pad(totalMinutos % 60)}`
}

export function diferencaEmDias(deIso: string, ateIso: string): number {
  const de = paraDate(deIso.split('T')[0])
  const ate = paraDate(ateIso.split('T')[0])
  return Math.round((ate.getTime() - de.getTime()) / 86_400_000)
}

export function idade(dataNascimento: string): number {
  const n = paraDate(dataNascimento)
  const h = new Date()
  let anos = h.getFullYear() - n.getFullYear()
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) anos--
  return anos
}

/** Índice 0 = segunda, para casar com o enum DiaSemana. */
export function indiceDiaSemana(iso: string): number {
  return (paraDate(iso).getDay() + 6) % 7
}

export function inicioDaSemana(iso: string): string {
  return somarDias(iso, -indiceDiaSemana(iso))
}
