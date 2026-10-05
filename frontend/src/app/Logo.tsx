import { cn } from '@/lib/cn'
import s from './Logo.module.css'

/** Marca: o traçado de um sinal vital dentro do quadrado — o registro que ganha pulso. */
export function MarcaVitalis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn(s.marca, className)} aria-hidden>
      <rect width="32" height="32" rx="8" className={s.fundo} />
      <path d="M5 17h5l2.5-6 4 12 3-9 1.5 3H27" fill="none" className={s.traco} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn(s.logo, className)}>
      <MarcaVitalis />
      <span className={s.textos}>
        <span className={s.nome}>Vitalis</span>
        <span className={s.sub}>Hospital</span>
      </span>
    </span>
  )
}
