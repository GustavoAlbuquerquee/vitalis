import { hhmm, hoje, isoData } from '@/lib/datas'
import { formatarData, relativo } from '@/lib/formato'
import { cn } from '@/lib/cn'

/** Data e hora local no formato do <input type="datetime-local">: yyyy-mm-ddTHH:mm. */
export function agora(): string {
  const d = new Date()
  return `${isoData(d)}T${hhmm(d.getHours() * 60 + d.getMinutes())}`
}

/** Tom da alta prevista: hoje pede atenção, no passado está atrasada. */
export function prazoDaAlta(dataPrevistaAlta: string) {
  const dia = hoje()
  if (dataPrevistaAlta < dia) return { atrasada: true, cor: 'text-danger', texto: `atrasada · ${relativo(dataPrevistaAlta)}` }
  if (dataPrevistaAlta === dia) return { atrasada: false, cor: 'text-warn', texto: 'hoje' }
  return { atrasada: false, cor: 'text-ink-3', texto: relativo(dataPrevistaAlta) }
}

/** Data prevista de alta em duas linhas: a data e quanto falta (ou quanto passou). */
export function AltaPrevista({ data, className }: { data: string; className?: string }) {
  const prazo = prazoDaAlta(data)
  return (
    <div className={cn('leading-tight', className)}>
      <p className={cn('text-sm tabular', prazo.atrasada ? 'font-medium text-danger' : 'text-ink')}>{formatarData(data)}</p>
      <p className={cn('mt-0.5 text-xs font-medium', prazo.cor)}>{prazo.texto}</p>
    </div>
  )
}
