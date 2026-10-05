import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

const controle =
  'w-full rounded-control border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] outline-none hover:border-ink-3 focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15'

interface CampoProps {
  rotulo: string
  /** Texto de ajuda abaixo do controle. Some quando há erro. */
  ajuda?: ReactNode
  erro?: string
  obrigatorio?: boolean
  className?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

/** Envolve qualquer controle com rótulo, ajuda e erro, ligando os atributos de acessibilidade. */
export function Campo({ rotulo, ajuda, erro, obrigatorio, className, children }: CampoProps) {
  const id = useId()
  const descId = erro || ajuda ? `${id}-desc` : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descId })}
      {erro ? (
        <p id={descId} className="text-xs text-danger">{erro}</p>
      ) : ajuda ? (
        <p id={descId} className="text-xs text-ink-3">{ajuda}</p>
      ) : null}
    </div>
  )
}

export const Entrada = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }>(function Entrada(
  { className, mono, ...props },
  ref,
) {
  return <input ref={ref} className={cn(controle, 'h-9', mono && 'font-mono text-sm tabular', className)} {...props} />
})

export const Selecao = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Selecao({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(controle, 'h-9 appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
    </div>
  )
})

export const AreaTexto = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTexto({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(controle, 'min-h-24 resize-y py-2 leading-relaxed', className)} {...props} />
})

interface BuscaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  valor: string
  aoMudar: (v: string) => void
}

export function Busca({ valor, aoMudar, className, placeholder = 'Buscar…', ...props }: BuscaProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className={cn(controle, 'h-9 pl-9')}
        {...props}
      />
    </div>
  )
}

/** Grupo de campos com título — divide formulários longos em blocos que se leem de uma vez. */
export function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-b border-line py-7 first:pt-0 last:border-0 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <h2 className="text-base font-semibold">{titulo}</h2>
        {descricao && <p className="mt-1 text-sm text-ink-3">{descricao}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-6">{children}</div>
    </section>
  )
}
