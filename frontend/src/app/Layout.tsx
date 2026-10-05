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
import s from './Layout.module.css'
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
    <nav aria-label="Principal" className={s.nav}>
      {grupos().map((g, i) => (
        <div key={i}>
          {g.titulo && <p className={s.grupoTitulo}>{g.titulo}</p>}
          <ul className={s.itens}>
            {g.itens.map((item) => (
              <li key={item.para}>
                <ItemNavegacao item={item} aoNavegar={aoNavegar} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className={s.rodapeNav}>
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
      className={({ isActive }) => cn(s.item, isActive && s.ativo)}
    >
      <span className={s.itemIcone}>{item.icone}</span>
      {item.rotulo}
      {!!item.contagem && <span className={s.contagem}>{item.contagem}</span>}
    </NavLink>
  )
}

function Usuario() {
  return (
    <div className={s.usuario}>
      <Avatar nome="Recepção Central" tamanho="sm" />
      <div className={s.usuarioTexto}>
        <p className={s.usuarioNome}>Recepção Central</p>
        <p className={s.usuarioLocal}>Térreo · Bloco A</p>
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
      className={s.busca}
    >
      <Search className={s.buscaIcone} aria-hidden />
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Buscar paciente por nome ou CPF"
        aria-label="Buscar paciente"
        className={s.buscaCampo}
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
    <div className={s.app}>
      <a
        href="#conteudo"
        className={s.pular}
        onClick={(e) => {
          // Com rotas por hash, "#conteudo" viraria uma rota: move o foco direto
          e.preventDefault()
          document.getElementById('conteudo')?.focus()
        }}
      >
        Pular para o conteúdo
      </a>

      {/* Menu lateral fixo — desktop */}
      <aside className={s.lateral}>
        <div className={s.marcaLateral}>
          <Logo />
        </div>
        <Navegacao />
        <Usuario />
      </aside>

      {/* Gaveta — mobile */}
      {menuAberto && (
        <div className={s.gaveta}>
          <div className={s.gavetaFundo} onClick={() => setMenuAberto(false)} aria-hidden />
          <aside className={s.gavetaPainel}>
            <div className={s.gavetaTopo}>
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

      <div className={s.coluna}>
        <header className={s.topo}>
          <BotaoIcone rotulo="Abrir menu" onClick={() => setMenuAberto(true)} className={s.abrirMenu}>
            <Menu />
          </BotaoIcone>
          <Logo className={s.logoTopo} />
          <BuscaGlobal />
          <div className={s.direita}>
            <div className={s.data}>
              <p className={s.dataDia}>{diaDaSemana(hoje())}</p>
              <p className={s.dataCompleta}>{formatarDataLonga(hoje())}</p>
            </div>
            <BotaoIcone rotulo={tema === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} onClick={alternar}>
              {tema === 'dark' ? <Sun /> : <Moon />}
            </BotaoIcone>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1} className={s.conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
