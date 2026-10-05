import type { SituacaoQuarto } from '@/tipos/dominio'
import { cn } from '@/lib/cn'
import s from './Ocupacao.module.css'

interface PontosProps {
  ocupacao: number
  capacidade: number
  situacao: SituacaoQuarto
  tamanho?: 'sm' | 'md'
}

/**
 * Um ponto por vaga do quarto: cheio = ocupado, vazado = livre.
 * É a representação direta da RN5 — dá para ver a capacidade, não só ler.
 */
export function PontosOcupacao({ ocupacao, capacidade, situacao, tamanho = 'md' }: PontosProps) {
  const bloqueado = situacao === 'MANUTENCAO' || situacao === 'INTERDITADO'
  return (
    <span className={cn(s.pontos, s[tamanho])} role="img" aria-label={`${ocupacao} de ${capacidade} vagas ocupadas`}>
      {Array.from({ length: capacidade }, (_, i) => (
        <span
          key={i}
          className={cn(s.ponto, bloqueado ? s.bloqueado : i < ocupacao && (situacao === 'OCUPADO' ? s.lotado : s.ocupado))}
        />
      ))}
    </span>
  )
}

/**
 * A mesma informação dos pontos, desenhada como leitos vistos de cima (planta baixa):
 * coberta cheia = ocupado, vazio = vaga, tracejado = quarto bloqueado.
 */
export function LeitosOcupacao({ ocupacao, capacidade, situacao }: Omit<PontosProps, 'tamanho'>) {
  const bloqueado = situacao === 'MANUTENCAO' || situacao === 'INTERDITADO'
  return (
    <span className={s.leitos} role="img" aria-label={`${ocupacao} de ${capacidade} vagas ocupadas`}>
      {Array.from({ length: capacidade }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 15 24"
          className={cn(s.leito, bloqueado ? s.leitoBloqueado : i < ocupacao && (situacao === 'OCUPADO' ? s.leitoLotado : s.leitoOcupado))}
          aria-hidden
        >
          <rect className={s.estrado} x="0.75" y="0.75" width="13.5" height="22.5" rx="2.5" />
          <rect className={s.travesseiro} x="3" y="2.8" width="9" height="4.2" rx="1.6" />
          <path className={s.coberta} d="M0.75 10.5h13.5v10.25a2.5 2.5 0 0 1-2.5 2.5h-8.5a2.5 2.5 0 0 1-2.5-2.5z" />
        </svg>
      ))}
    </span>
  )
}

interface BarraProps {
  valor: number
  total: number
  className?: string
  /** A partir de qual fração a barra fica em alerta. */
  limiteAlerta?: number
}

export function BarraProgresso({ valor, total, className, limiteAlerta = 0.85 }: BarraProps) {
  const fracao = total ? valor / total : 0
  return (
    <div className={cn(s.trilho, className)} role="progressbar" aria-valuenow={valor} aria-valuemax={total}>
      <div className={cn(s.barra, fracao >= limiteAlerta && s.alerta)} style={{ width: `${Math.min(100, fracao * 100)}%` }} />
    </div>
  )
}
