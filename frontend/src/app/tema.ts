import { useCallback, useSyncExternalStore } from 'react'

export type Tema = 'light' | 'dark'

const ler = (): Tema => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
const ouvintes = new Set<() => void>()

export function useTema() {
  const tema = useSyncExternalStore(
    (cb) => (ouvintes.add(cb), () => ouvintes.delete(cb)),
    ler,
    () => 'light' as Tema,
  )
  const alternar = useCallback(() => {
    const novo: Tema = ler() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = novo
    try {
      localStorage.setItem('vitalis-tema', novo === 'dark' ? 'escuro' : 'claro')
    } catch {
      /* armazenamento indisponível: o tema vale só nesta aba */
    }
    ouvintes.forEach((cb) => cb())
  }, [])
  return { tema, alternar }
}
