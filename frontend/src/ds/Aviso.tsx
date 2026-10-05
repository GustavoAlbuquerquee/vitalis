import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { Tom } from '@/lib/rotulos'
import s from './Aviso.module.css'

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
        <div aria-live="polite" className={s.pilha}>
          {avisos.map((a) => {
            const Icone = a.tom === 'ok' ? CircleCheck : a.tom === 'danger' ? TriangleAlert : Info
            return (
              <div key={a.id} role="status" data-tom={a.tom} className={s.aviso}>
                <Icone className={s.icone} />
                <div className={s.texto}>
                  <p className={s.titulo}>{a.titulo}</p>
                  {a.descricao && <p className={s.descricao}>{a.descricao}</p>}
                </div>
                <button onClick={() => remover(a.id)} className={s.dispensar} aria-label="Dispensar">
                  <X />
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
