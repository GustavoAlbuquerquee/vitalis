import type { SituacaoQuarto } from '@/tipos/dominio'
import { cn } from '@/lib/cn'

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
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${ocupacao} de ${capacidade} vagas ocupadas`}>
      {Array.from({ length: capacidade }, (_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-full border-[1.5px]',
            tamanho === 'sm' ? 'size-2' : 'size-2.5',
            bloqueado
              ? 'border-dashed border-ink-3'
              : i < ocupacao
                ? situacao === 'OCUPADO'
                  ? 'border-danger bg-danger'
                  : 'border-brand bg-brand'
                : 'border-line-strong bg-transparent',
          )}
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
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-surface-3', className)} role="progressbar" aria-valuenow={valor} aria-valuemax={total}>
      <div className={cn('h-full rounded-full transition-[width] duration-500', fracao >= limiteAlerta ? 'bg-warn' : 'bg-brand')} style={{ width: `${Math.min(100, fracao * 100)}%` }} />
    </div>
  )
}
