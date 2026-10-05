import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import s from './Formulario.module.css'

interface CampoProps {
  rotulo: string
  /** Texto de ajuda abaixo do controle. Some quando há erro. */
  ajuda?: ReactNode
  erro?: string
  obrigatorio?: boolean
  className?: string
  /** Quantas das 6 colunas da Secao o campo ocupa a partir de 640px. */
  colunas?: 1 | 2 | 3 | 4 | 5 | 6
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

/** Envolve qualquer controle com rótulo, ajuda e erro, ligando os atributos de acessibilidade. */
export function Campo({ rotulo, ajuda, erro, obrigatorio, className, colunas, children }: CampoProps) {
  const id = useId()
  const descId = erro || ajuda ? `${id}-desc` : undefined
  return (
    <div className={cn(s.campo, className)} data-colunas={colunas}>
      <label htmlFor={id} className={s.rotulo}>
        {rotulo}
        {obrigatorio && (
          <span className={s.obrigatorio} aria-hidden>
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descId })}
      {erro ? (
        <p id={descId} className={s.erro}>
          {erro}
        </p>
      ) : ajuda ? (
        <p id={descId} className={s.ajuda}>
          {ajuda}
        </p>
      ) : null}
    </div>
  )
}

export const Entrada = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }>(function Entrada(
  { className, mono, ...props },
  ref,
) {
  return <input ref={ref} className={cn(s.controle, s.linha, mono && s.mono, className)} {...props} />
})

export const Selecao = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Selecao({ className, children, ...props }, ref) {
  return (
    <div className={cn(s.envoltorio, className)}>
      <select ref={ref} className={cn(s.controle, s.linha, s.selecao)} {...props}>
        {children}
      </select>
      <ChevronDown className={s.seta} aria-hidden />
    </div>
  )
})

export const AreaTexto = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTexto({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(s.controle, s.area, className)} {...props} />
})

interface BuscaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  valor: string
  aoMudar: (v: string) => void
}

export function Busca({ valor, aoMudar, className, placeholder = 'Buscar…', ...props }: BuscaProps) {
  return (
    <div className={cn(s.envoltorio, className)}>
      <Search className={s.lupa} aria-hidden />
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className={cn(s.controle, s.linha, s.busca)}
        {...props}
      />
    </div>
  )
}

/** Grupo de campos com título — divide formulários longos em blocos que se leem de uma vez. */
export function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className={s.secao}>
      <div>
        <h2 className={s.secaoTitulo}>{titulo}</h2>
        {descricao && <p className={s.secaoDescricao}>{descricao}</p>}
      </div>
      <div className={s.grade}>{children}</div>
    </section>
  )
}
