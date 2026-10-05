import { iniciais } from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './Avatar.module.css'

interface AvatarProps {
  nome: string
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/** Iniciais sobre uma cor estável derivada do nome — a mesma pessoa tem sempre a mesma cor. */
export function Avatar({ nome, tamanho = 'md', className }: AvatarProps) {
  const h = [...nome].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7)
  return (
    <span aria-hidden className={cn(s.avatar, s[`c${h % 6}`], s[tamanho], className)}>
      {iniciais(nome)}
    </span>
  )
}
