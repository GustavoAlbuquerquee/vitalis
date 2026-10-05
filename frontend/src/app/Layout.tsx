import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  BedDouble,
  CalendarDays,
  DoorOpen,
  LayoutGrid,
  Menu,
  Moon,
  Palette,
  Search,
  Stethoscope,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { Avatar, BotaoIcone } from '@/ds'
import { cn } from '@/lib/cn'
import { hoje } from '@/lib/datas'
import { formatarDataLonga, diaDaSemana } from '@/lib/formato'
import { listarConsultas, listarInternacoes } from '@/api'
import { Logo } from './Logo'
import { useTema } from './tema'

interface ItemMenu {
  para: string
  rotulo: string
  icone: ReactNode
  contagem?: number
  fim?: boolean
}

function grupos(): { titulo?: string; itens: ItemMenu[] }[] {
  const consultasHoje = listarConsultas({ data: hoje(), status: 'AGENDADA' }).length
  const ativas = listarInternacoes({ status: 'ATIVA' }).length
  return [
    { itens: [{ para: '/', rotulo: 'Painel', icone: <LayoutGrid />, fim: true }] },
    {
      titulo: 'Atendimento',
      itens: [
        { para: '/consultas', rotulo: 'Agenda', icone: <CalendarDays />, contagem: consultasHoje },
        { para: '/internacoes', rotulo: 'Internações', icone: <BedDouble />, contagem: ativas },
      ],
    },
    {
      titulo: 'Cadastros',
      itens: [
        { para: '/pacientes', rotulo: 'Pacientes', icone: <Users /> },
        { para: '/profissionais', rotulo: 'Profissionais', icone: <Stethoscope /> },
        { para: '/quartos', rotulo: 'Quartos', icone: <DoorOpen /> },
      ],
    },
  ]
}

function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <nav aria-label="Principal" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {grupos().map((g, i) => (
        <div key={i}>
          {g.titulo && <p className="mb-1.5 px-2.5 text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">{g.titulo}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.itens.map((item) => (
              <li key={item.para}>
                <ItemNavegacao item={item} aoNavegar={aoNavegar} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto">
        <ItemNavegacao item={{ para: '/design-system', rotulo: 'Design system', icone: <Palette /> }} aoNavegar={aoNavegar} />
      </div>
    </nav>
  )
}

function ItemNavegacao({ item, aoNavegar }: { item: ItemMenu; aoNavegar?: () => void }) {
  return (
    <NavLink
      to={item.para}
      end={item.fim}
      onClick={aoNavegar}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center gap-2.5 rounded-control px-2.5 text-base font-medium transition-colors [&_svg]:size-[18px]',
          isActive ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line' : 'text-ink-2 hover:bg-surface-3/60 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn(isActive ? 'text-brand' : 'text-ink-3 group-hover:text-ink-2')}>{item.icone}</span>
          {item.rotulo}
          {!!item.contagem && (
            <span className={cn('ml-auto rounded-full px-1.5 text-2xs font-semibold tabular', isActive ? 'bg-brand-soft text-brand-ink' : 'bg-surface-3 text-ink-2')}>
              {item.contagem}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function Usuario() {
  return (
    <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
      <Avatar nome="Recepção Central" tamanho="sm" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium">Recepção Central</p>
        <p className="truncate text-xs text-ink-3">Térreo · Bloco A</p>
      </div>
    </div>
  )
}

function BuscaGlobal() {
  const navegar = useNavigate()
  const [valor, setValor] = useState('')
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        navegar(`/pacientes?busca=${encodeURIComponent(valor)}`)
        setValor('')
      }}
      className="relative hidden w-full max-w-sm md:block"
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Buscar paciente por nome ou CPF"
        aria-label="Buscar paciente"
        className="h-9 w-full rounded-control border border-transparent bg-surface-2 pr-3 pl-9 text-base text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:bg-surface focus:ring-3 focus:ring-brand/15"
      />
    </form>
  )
}

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { tema, alternar } = useTema()
  const local = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [local.pathname])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>

      {/* Menu lateral fixo — desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface-2 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <Navegacao />
        <Usuario />
      </aside>

      {/* Gaveta — mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-entrar bg-overlay" onClick={() => setMenuAberto(false)} aria-hidden />
          <aside className="relative flex h-full w-[280px] animate-subir flex-col bg-surface-2 shadow-modal">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo />
              <BotaoIcone rotulo="Fechar menu" onClick={() => setMenuAberto(false)}>
                <X />
              </BotaoIcone>
            </div>
            <Navegacao aoNavegar={() => setMenuAberto(false)} />
            <Usuario />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-8">
          <BotaoIcone rotulo="Abrir menu" onClick={() => setMenuAberto(true)} className="-ml-2 lg:hidden">
            <Menu />
          </BotaoIcone>
          <Logo className="lg:hidden" />
          <BuscaGlobal />
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium first-letter:uppercase">{diaDaSemana(hoje())}</p>
              <p className="text-xs text-ink-3">{formatarDataLonga(hoje())}</p>
            </div>
            <BotaoIcone rotulo={tema === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} onClick={alternar}>
              {tema === 'dark' ? <Sun /> : <Moon />}
            </BotaoIcone>
          </div>
        </header>
        <main id="conteudo" className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
