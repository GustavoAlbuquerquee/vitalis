import { useEffect, useRef, useState } from 'react'
import { EyeOff } from 'lucide-react'
import { formatarCpf, mascararCpf } from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './CpfProtegido.module.css'

/**
 * CPF mascarado por padrão, no formato que a LGPD recomenda para exibição: •••.456.789-••.
 * Passar o mouse ou focar com o teclado revela o número inteiro, com os dígitos
 * "rolando" até assentar — dá para ver que algo sensível foi aberto.
 */
export function CpfProtegido({ cpf, className }: { cpf: string; className?: string }) {
  const completo = formatarCpf(cpf)
  const mascarado = mascararCpf(cpf)
  const [texto, setTexto] = useState<{ c: string; rolando: boolean }[]>(() => [...mascarado].map((c) => ({ c, rolando: false })))
  const [aberto, setAberto] = useState(false)
  const quadro = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(quadro.current)
    const alvo = aberto ? completo : mascarado
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches
    // Só as posições que mudam entre mascarado e completo rolam
    const muda = [...alvo].map((c, i) => c !== (aberto ? mascarado : completo)[i])
    if (reduzido || !aberto) {
      setTexto([...alvo].map((c) => ({ c, rolando: false })))
      return
    }
    const inicio = performance.now()
    const passo = (agora: number) => {
      const t = (agora - inicio) / 260
      setTexto(
        [...alvo].map((c, i) => {
          if (!muda[i]) return { c, rolando: false }
          // cada posição assenta um pouco depois da anterior
          const assentou = t > 0.35 + (i / alvo.length) * 0.65
          return assentou ? { c, rolando: false } : { c: String(Math.floor(Math.random() * 10)), rolando: true }
        }),
      )
      if (t < 1) quadro.current = requestAnimationFrame(passo)
    }
    quadro.current = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro.current)
  }, [aberto, completo, mascarado])

  return (
    <span
      tabIndex={0}
      className={cn(s.cpf, className)}
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
      aria-label={`CPF ${aberto ? completo : 'protegido, foque para revelar'}`}
      title={aberto ? undefined : 'Passe o mouse para revelar'}
    >
      <span aria-hidden>
        {texto.map((x, i) => (
          <span key={i} className={cn(x.rolando && s.embaralhado, !aberto && x.c === '•' && s.oculto)}>
            {x.c}
          </span>
        ))}
      </span>
      <EyeOff className={s.icone} aria-hidden />
    </span>
  )
}
