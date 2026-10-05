import { cn } from '@/lib/cn'

/** Marca: o traçado de um sinal vital dentro do quadrado — o registro que ganha pulso. */
export function MarcaVitalis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path d="M5 17h5l2.5-6 4 12 3-9 1.5 3H27" fill="none" className="stroke-on-brand" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <MarcaVitalis />
      <span className="flex flex-col leading-none">
        <span className="text-md font-semibold tracking-[-0.02em]">Vitalis</span>
        <span className="mt-0.5 text-2xs font-medium tracking-wide text-ink-3 uppercase">Hospital</span>
      </span>
    </span>
  )
}
