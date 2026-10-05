import type { ReactNode } from 'react'
import { Hand } from 'lucide-react'
import HoldButton from './react-bits/HoldButton'
import s from './BotaoSegurar.module.css'

interface BotaoSegurarProps {
  /** Texto enquanto não confirmado: "Segure para registrar a alta". */
  children: ReactNode
  /** Texto depois de confirmado: "Alta registrada". */
  feito: ReactNode
  aoConfirmar: () => void
  variante?: 'perigo' | 'primario'
  icone?: ReactNode
  disabled?: boolean
  /** Tempo segurando, em ms. Padrão 1,2s: longo o bastante para não ser acidente, curto para não irritar. */
  duracao?: number
}

/**
 * Confirmação por gesto: o botão precisa ficar pressionado até encher.
 * Usado no lugar de "tem certeza?" para o que muda o prontuário: alta, cancelamento, desativação.
 * Funciona com mouse, toque e teclado (Espaço ou Enter segurados).
 */
export function BotaoSegurar({ children, feito, aoConfirmar, variante = 'perigo', icone, disabled, duracao = 1200 }: BotaoSegurarProps) {
  const cor = variante === 'perigo' ? 'var(--danger)' : 'var(--brand)'
  const texto = variante === 'perigo' ? 'var(--on-danger)' : 'var(--on-brand)'
  return (
    <div className={s.envoltorio}>
      <HoldButton
        className={s.botao}
        size="sm"
        radius={7}
        holdTime={duracao}
        backgroundColor="var(--surface-3)"
        textColor={cor}
        fillColor={cor}
        fillTextColor={texto}
        icon={icone}
        doneLabel={feito}
        glow={false}
        resetAfter={0}
        disabled={disabled}
        // meio segundo mostrando o estado "feito" antes de seguir, para a confirmação ser vista
        onHold={() => window.setTimeout(aoConfirmar, 500)}
      >
        {children}
      </HoldButton>
      <span className={s.dica} aria-hidden>
        <Hand /> Mantenha pressionado
      </span>
    </div>
  )
}
