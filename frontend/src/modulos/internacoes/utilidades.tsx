import { hhmm, hoje, isoData } from '@/lib/datas'
import { formatarData, relativo } from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './utilidades.module.css'

/** Data e hora local no formato do <input type="datetime-local">: yyyy-mm-ddTHH:mm. */
export function agora(): string {
  const d = new Date()
  return `${isoData(d)}T${hhmm(d.getHours() * 60 + d.getMinutes())}`
}

/** Tom da alta prevista: hoje pede atenção, no passado está atrasada. `cor` é uma classe CSS que só define a cor do texto. */
export function prazoDaAlta(dataPrevistaAlta: string) {
  const dia = hoje()
  if (dataPrevistaAlta < dia) return { atrasada: true, cor: s.corAtrasada, texto: `atrasada · ${relativo(dataPrevistaAlta)}` }
  if (dataPrevistaAlta === dia) return { atrasada: false, cor: s.corHoje, texto: 'hoje' }
  return { atrasada: false, cor: s.corFutura, texto: relativo(dataPrevistaAlta) }
}

/** Data prevista de alta em duas linhas: a data e quanto falta (ou quanto passou). */
export function AltaPrevista({ data, className }: { data: string; className?: string }) {
  const prazo = prazoDaAlta(data)
  return (
    <div className={cn(s.alta, className)}>
      <p className={cn(s.data, prazo.atrasada && s.dataAtrasada, 'tabular')}>{formatarData(data)}</p>
      <p className={cn(s.prazo, prazo.cor)}>{prazo.texto}</p>
    </div>
  )
}
