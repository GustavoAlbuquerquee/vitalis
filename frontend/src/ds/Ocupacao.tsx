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
