import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BotaoIcone } from './Botao'
import { cn } from '@/lib/cn'

interface ModalProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: ReactNode
  children?: ReactNode
  rodape?: ReactNode
  largura?: 'sm' | 'md' | 'lg'
}

const larguras = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-entrar bg-overlay" onClick={aoFechar} aria-hidden />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-subir flex-col rounded-t-card border border-line bg-surface shadow-modal outline-none sm:rounded-card',
          larguras[largura],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
          <div>
            <h2 id={`${id}-t`} className="text-md font-semibold">{titulo}</h2>
            {descricao && <div className="mt-1 text-sm text-ink-2">{descricao}</div>}
          </div>
          <BotaoIcone rotulo="Fechar" tamanho="sm" onClick={aoFechar} data-fechar className="-mt-1 -mr-2">
            <X />
          </BotaoIcone>
        </div>
        {children && <div className="overflow-y-auto px-6 py-4">{children}</div>}
        {rodape && <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-2/50 px-6 py-3.5 sm:flex-row sm:justify-end">{rodape}</div>}
      </div>
    </div>,
    document.body,
  )
}
