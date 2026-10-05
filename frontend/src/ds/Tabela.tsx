import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import s from './Tabela.module.css'

export function Tabela({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(s.rolagem, className)}>
      <table className={s.tabela}>{children}</table>
    </div>
  )
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn(s.th, className)} {...props} />
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn(s.td, className)} {...props} />
}

/** Linha inteira clicável, mas o link real fica na célula principal para leitores de tela e Ctrl+clique. */
export function Linha({ para, className, ...props }: HTMLAttributes<HTMLTableRowElement> & { para?: string }) {
  const navegar = useNavigate()
  return (
    <tr
      onClick={para ? (e) => !(e.target as HTMLElement).closest('a,button') && navegar(para) : undefined}
      className={cn(s.linha, para && s.clicavel, className)}
      {...props}
    />
  )
}
