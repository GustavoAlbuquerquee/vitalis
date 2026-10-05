import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { tons } from './tons'

interface Aviso {
  id: number
  titulo: string
  descricao?: string
  tom: Extract<Tom, 'ok' | 'info' | 'danger'>
}

type Avisar = (a: Omit<Aviso, 'id' | 'tom'> & { tom?: Aviso['tom'] }) => void

const Contexto = createContext<Avisar>(() => {})

/** Toasts no canto inferior direito. Somem sozinhos em 5s. */
export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const remover = useCallback((id: number) => setAvisos((l) => l.filter((a) => a.id !== id)), [])
  const avisar = useCallback<Avisar>(
    (a) => {
      const id = Date.now() + Math.random()
      setAvisos((l) => [...l.slice(-2), { tom: 'ok', ...a, id }])
      setTimeout(() => remover(id), 5000)
    },
    [remover],
  )

  return (
    <Contexto.Provider value={avisar}>
      {children}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
          {avisos.map((a) => {
            const Icone = a.tom === 'ok' ? CircleCheck : a.tom === 'danger' ? TriangleAlert : Info
            return (
              <div key={a.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-subir gap-3 rounded-card border border-line bg-surface p-3.5 pr-2.5 shadow-pop">
                <Icone className={cn('mt-0.5 size-[18px] shrink-0', tons[a.tom].texto)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{a.titulo}</p>
                  {a.descricao && <p className="mt-0.5 text-sm text-ink-2">{a.descricao}</p>}
                </div>
                <button onClick={() => remover(a.id)} className="self-start rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Dispensar">
                  <X className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </Contexto.Provider>
  )
}

export const useAviso = () => useContext(Contexto)

/** Aviso padrão enquanto não existe back-end: a ação foi entendida, mas nada foi gravado. */
export function usePrototipo() {
  const avisar = useAviso()
  return (titulo: string) => avisar({ titulo, descricao: 'Protótipo de interface — nada foi gravado. A integração com a API vem na próxima etapa.', tom: 'info' })
}
