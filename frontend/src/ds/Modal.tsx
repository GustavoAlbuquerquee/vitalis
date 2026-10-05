import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BotaoIcone } from './Botao'
import { cn } from '@/lib/cn'
import s from './Modal.module.css'

interface ModalProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: ReactNode
  children?: ReactNode
  rodape?: ReactNode
  largura?: 'sm' | 'md' | 'lg'
}

export function Modal({ aberto, aoFechar, titulo, descricao, children, rodape, largura = 'md' }: ModalProps) {
  const id = useId()
  const painel = useRef<HTMLDivElement>(null)
  // Guardado em ref: o efeito abaixo roda só ao abrir/fechar, não a cada render do pai
  const fechar = useRef(aoFechar)
  fechar.current = aoFechar

  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement as HTMLElement | null
    const primeiro = painel.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-fechar])')
    ;(primeiro ?? painel.current)?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar.current()
      if (e.key === 'Tab' && painel.current) {
        const focaveis = painel.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input, select, textarea, [tabindex]:not([tabindex="-1"])')
        const lista = Array.from(focaveis)
        if (!lista.length) return
        const [p, u] = [lista[0], lista[lista.length - 1]]
        if (e.shiftKey && document.activeElement === p) (e.preventDefault(), u.focus())
        else if (!e.shiftKey && document.activeElement === u) (e.preventDefault(), p.focus())
      }
    }
    document.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
      anterior?.focus()
    }
  }, [aberto])

  if (!aberto) return null

  return createPortal(
    <div className={s.raiz}>
      <div className={s.fundo} onClick={aoFechar} aria-hidden />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        tabIndex={-1}
        className={cn(s.painel, s[largura])}
      >
        <div className={s.topo}>
          <div>
            <h2 id={`${id}-t`} className={s.titulo}>
              {titulo}
            </h2>
            {descricao && <div className={s.descricao}>{descricao}</div>}
          </div>
          <BotaoIcone rotulo="Fechar" tamanho="sm" onClick={aoFechar} data-fechar className={s.fechar}>
            <X />
          </BotaoIcone>
        </div>
        {children && <div className={s.corpo}>{children}</div>}
        {rodape && <div className={s.rodape}>{rodape}</div>}
      </div>
    </div>,
    document.body,
  )
}
