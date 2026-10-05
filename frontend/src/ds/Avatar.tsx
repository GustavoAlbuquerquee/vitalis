import { iniciais } from '@/lib/formato'
import { cn } from '@/lib/cn'

const paleta = [
  'bg-[#dcebe6] text-[#0a4f44] dark:bg-[#12352e] dark:text-[#7fdcc6]',
  'bg-[#e4e8f4] text-[#2d4a86] dark:bg-[#1a2540] dark:text-[#9db7ea]',
  'bg-[#f3e6dc] text-[#86471f] dark:bg-[#33231a] dark:text-[#e3b08c]',
  'bg-[#ece3f0] text-[#6a3d7d] dark:bg-[#2c1f33] dark:text-[#cfa6e0]',
  'bg-[#e9ecd9] text-[#545f1d] dark:bg-[#262b15] dark:text-[#c3cf86]',
  'bg-[#f2e1e3] text-[#8a2f3b] dark:bg-[#341a1e] dark:text-[#eaa1aa]',
]

interface AvatarProps {
  nome: string
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const tamanhos = { sm: 'size-7 text-2xs', md: 'size-9 text-xs', lg: 'size-11 text-sm', xl: 'size-16 text-lg' }

/** Iniciais sobre uma cor estável derivada do nome — a mesma pessoa tem sempre a mesma cor. */
export function Avatar({ nome, tamanho = 'md', className }: AvatarProps) {
  const h = [...nome].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide', paleta[h % paleta.length], tamanhos[tamanho], className)}
    >
      {iniciais(nome)}
    </span>
  )
}
