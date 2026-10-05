import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

export type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'perigo'
export type TamanhoBotao = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-[background-color,border-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 select-none'

const variantes: Record<VarianteBotao, string> = {
  primario: 'bg-brand text-on-brand hover:bg-brand-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]',
  secundario: 'bg-surface text-ink border border-line-strong hover:bg-surface-2 shadow-[0_1px_0_rgb(0_0_0/0.03)]',
  fantasma: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  perigo: 'bg-danger text-white hover:brightness-95 dark:text-[#2a0a0c]',
}

const tamanhos: Record<TamanhoBotao, string> = {
  sm: 'h-8 px-3 text-sm [&_svg]:size-3.5',
  md: 'h-9 px-3.5 text-base [&_svg]:size-4',
}

interface Comum {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  icone?: ReactNode
  iconeDireita?: ReactNode
}

export const classesBotao = ({ variante = 'secundario', tamanho = 'md' }: Comum = {}, extra?: string) =>
  cn(base, variantes[variante], tamanhos[tamanho], extra)

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement>, Comum {
  carregando?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante, tamanho, icone, iconeDireita, carregando, className, children, type = 'button', disabled, ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || carregando} className={classesBotao({ variante, tamanho }, className)} {...props}>
      {carregando ? <LoaderCircle className="animate-spin" /> : icone}
      {children}
      {iconeDireita}
    </button>
  )
})

export function BotaoLink({ variante, tamanho, icone, iconeDireita, className, children, ...props }: LinkProps & Comum) {
  return (
    <Link className={classesBotao({ variante, tamanho }, className)} {...props}>
      {icone}
      {children}
      {iconeDireita}
    </Link>
  )
}

interface BotaoIconeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  rotulo: string
  tamanho?: TamanhoBotao
}

export const BotaoIcone = forwardRef<HTMLButtonElement, BotaoIconeProps>(function BotaoIcone(
  { rotulo, tamanho = 'md', className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40',
        tamanho === 'sm' ? 'size-8 [&_svg]:size-4' : 'size-9 [&_svg]:size-[18px]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})
