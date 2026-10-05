import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'

export function Tabela({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-base">{children}</table>
    </div>
  )
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-10 border-b border-line bg-surface-2/60 px-4 text-xs font-medium whitespace-nowrap text-ink-3 first:pl-5 last:pr-5', className)} {...props} />
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('h-14 border-b border-line px-4 align-middle first:pl-5 last:pr-5', className)} {...props} />
}

/** Linha inteira clicável, mas o link real fica na célula principal para leitores de tela e Ctrl+clique. */
export function Linha({ para, className, ...props }: HTMLAttributes<HTMLTableRowElement> & { para?: string }) {
  const navegar = useNavigate()
  return (
    <tr
      onClick={para ? (e) => !(e.target as HTMLElement).closest('a,button') && navegar(para) : undefined}
      className={cn('transition-colors [&:last-child>td]:border-0', para && 'cursor-pointer hover:bg-surface-2/60', className)}
      {...props}
    />
  )
}
