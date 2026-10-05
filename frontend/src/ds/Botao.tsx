import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import s from './Botao.module.css'

export type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'perigo'
export type TamanhoBotao = 'sm' | 'md'

interface Comum {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  icone?: ReactNode
  iconeDireita?: ReactNode
}

export const classesBotao = ({ variante = 'secundario', tamanho = 'md' }: Comum = {}, extra?: string) => cn(s.botao, s[variante], s[tamanho], extra)

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement>, Comum {
  carregando?: boolean
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante, tamanho, icone, iconeDireita, carregando, className, children, type = 'button', disabled, ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || carregando} className={classesBotao({ variante, tamanho }, className)} {...props}>
      {carregando ? <LoaderCircle className={s.girando} /> : icone}
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
      className={cn(s.icone, tamanho === 'sm' ? s.iconeSm : s.iconeMd, className)}
      {...props}
    >
      {children}
    </button>
  )
})
