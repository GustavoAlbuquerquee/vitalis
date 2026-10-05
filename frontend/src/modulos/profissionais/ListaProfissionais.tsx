import { useState } from 'react'
import { Link } from 'react-router'
import { LayoutGrid, List, SearchX, UserPlus } from 'lucide-react'
import { Botao, BotaoLink, Busca, CabecalhoPagina, Cartao, EstadoVazio, Etiqueta, Linha, Pagina, Pilulas, Segmentado, Selo, Tabela, Td, Th, Avatar } from '@/ds'
import { Pessoa, nomeEspecialidade } from '@/componentes/dominio'
import { listarConsultas, listarProfissionais } from '@/api'
import { hoje, indiceDiaSemana, minutos } from '@/lib/datas'
import { formatarTelefone, normalizar, plural } from '@/lib/formato'
import { diasSemana, especialidades, type Tom } from '@/lib/rotulos'
import type { Especialidade, ProfissionalSaude } from '@/tipos/dominio'
import { cn } from '@/lib/cn'

type Filtro = Especialidade | 'TODAS'
type Visao = 'grade' | 'tabela'

/** Situação de hoje a partir das janelas de disponibilidade do dia da semana. */
function situacaoHoje(p: ProfissionalSaude, agora: number): { rotulo: string; tom: Tom } {
  const dia = diasSemana[indiceDiaSemana(hoje())].valor
  const janelas = p.disponibilidades.filter((j) => j.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  if (!janelas.length) return { rotulo: 'Não atende hoje', tom: 'neutral' }
  const atual = janelas.find((j) => minutos(j.horaInicio) <= agora && agora < minutos(j.horaFim))
  if (atual) return { rotulo: `Atendendo agora até ${atual.horaFim}`, tom: 'ok' }
  const proxima = janelas.find((j) => minutos(j.horaInicio) > agora)
  if (proxima) return { rotulo: `Atende hoje das ${proxima.horaInicio}`, tom: 'info' }
  return { rotulo: `Encerrou às ${janelas[janelas.length - 1].horaFim}`, tom: 'neutral' }
}

function consultasHoje(p: ProfissionalSaude) {
  const lista = listarConsultas({ profissionalId: p.id, data: hoje() }).filter((c) => c.status !== 'CANCELADA')
  return { total: lista.length, aSeguir: lista.filter((c) => c.status === 'AGENDADA').length }
}

/** Sete chips Seg…Dom; os dias com janela de disponibilidade ficam destacados. */
function DiasAtendimento({ p }: { p: ProfissionalSaude }) {
  const indiceHoje = indiceDiaSemana(hoje())
  const atende = diasSemana.filter((d) => p.disponibilidades.some((j) => j.diaSemana === d.valor))
  return (
    <div role="img" aria-label={atende.length ? `Atende: ${atende.map((d) => d.rotulo).join(', ')}` : 'Sem disponibilidade cadastrada'} className="flex gap-1">
      {diasSemana.map((d, i) => {
        const ativo = atende.includes(d)
        return (
          <span
            key={d.valor}
            aria-hidden
            className={cn(
              'flex h-6 min-w-0 flex-1 items-center justify-center rounded-[5px] text-2xs font-medium',
              ativo ? 'bg-brand-soft text-brand-ink' : 'bg-surface-2 text-ink-3',
              i === indiceHoje && 'ring-1 ring-ink-3 ring-inset',
            )}
          >
            {d.curto}
          </span>
        )
      })}
    </div>
  )
}

export function ListaProfissionais() {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [visao, setVisao] = useState<Visao>('grade')

  const agora = new Date().getHours() * 60 + new Date().getMinutes()
  const todos = listarProfissionais()
  const atendendoAgora = todos.filter((p) => situacaoHoje(p, agora).tom === 'ok').length

  const q = normalizar(busca.trim())
  const digitos = busca.replace(/\D/g, '')
  const encontrados = todos.filter(
    (p) =>
      !q ||
      normalizar(p.nome).includes(q) ||
      normalizar(p.registroProfissional).includes(q) ||
      (digitos.length >= 2 && p.registroProfissional.replace(/\D/g, '').includes(digitos)),
  )
  const visiveis = encontrados.filter((p) => filtro === 'TODAS' || p.especialidade === filtro)

  // Só as especialidades que existem no cadastro, na ordem do enum
  const presentes = (Object.keys(especialidades) as Especialidade[]).filter((e) => todos.some((p) => p.especialidade === e))
  const opcoesFiltro = [
    { valor: 'TODAS' as Filtro, rotulo: 'Todas', contagem: encontrados.length },
    ...presentes.map((e) => ({ valor: e as Filtro, rotulo: especialidades[e].rotulo, contagem: encontrados.filter((p) => p.especialidade === e).length })),
  ]

  const limpar = () => {
    setBusca('')
    setFiltro('TODAS')
  }

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Profissionais"
        descricao={`${plural(todos.length, 'profissional da saúde', 'profissionais da saúde')} cadastrados · ${atendendoAgora} atendendo agora`}
        acoes={
          <BotaoLink to="/profissionais/novo" variante="primario" icone={<UserPlus />}>
            Novo profissional
          </BotaoLink>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou registro…" aria-label="Buscar profissional" className="min-w-0 flex-1 sm:max-w-sm" />
          <Segmentado
            rotulo="Modo de visualização"
            valor={visao}
            aoMudar={setVisao}
            className="ml-auto"
            opcoes={[
              { valor: 'grade', rotulo: <><LayoutGrid aria-hidden /><span className="sr-only sm:not-sr-only">Grade</span></> },
              { valor: 'tabela', rotulo: <><List aria-hidden /><span className="sr-only sm:not-sr-only">Tabela</span></> },
            ]}
          />
        </div>
        <Pilulas rotulo="Filtrar por especialidade" valor={filtro} aoMudar={setFiltro} opcoes={opcoesFiltro} />
      </div>

      {visiveis.length === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<SearchX />}
            titulo="Nenhum profissional encontrado"
            descricao="Nenhum cadastro corresponde à busca e ao filtro escolhidos. Confira a grafia ou o número do registro."
            acao={<Botao onClick={limpar}>Limpar filtros</Botao>}
          />
        </Cartao>
      ) : visao === 'grade' ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visiveis.map((p) => {
            const s = situacaoHoje(p, agora)
            const n = consultasHoje(p)
            return (
              <li key={p.id} className="min-w-0">
                <Link
                  to={`/profissionais/${p.id}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface transition-colors hover:border-line-strong"
                >
                  <div className="flex items-start gap-3 px-5 pt-5">
                    <Avatar nome={p.nome} tamanho="lg" />
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-medium text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">{p.nome}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-2">{nomeEspecialidade(p)}</p>
                      <p className="mt-1 truncate font-mono text-xs text-ink-3 tabular">{p.registroProfissional}</p>
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-4">
                    <DiasAtendimento p={p} />
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line px-5 py-3">
                    <Selo tom={s.tom}>{s.rotulo}</Selo>
                    <span className="text-sm text-ink-3 tabular">
                      {n.total ? `${plural(n.total, 'consulta')} hoje` : 'Sem consultas hoje'}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Cartao>
          <Tabela>
            <thead>
              <tr>
                <Th>Profissional</Th>
                <Th>Especialidade</Th>
                <Th>Registro</Th>
                <Th>Contato</Th>
                <Th>Hoje</Th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => {
                const s = situacaoHoje(p, agora)
                const n = consultasHoje(p)
                return (
                  <Linha key={p.id} para={`/profissionais/${p.id}`}>
                    <Td className="min-w-[220px]">
                      <Pessoa nome={p.nome} para={`/profissionais/${p.id}`} />
                    </Td>
                    <Td>
                      <Etiqueta>{nomeEspecialidade(p)}</Etiqueta>
                    </Td>
                    <Td className="font-mono text-sm whitespace-nowrap text-ink-2 tabular">{p.registroProfissional}</Td>
                    <Td className="text-sm whitespace-nowrap">
                      <p className="text-ink-2 tabular">{formatarTelefone(p.telefone)}</p>
                      <p className="text-xs text-ink-3">{p.email}</p>
                    </Td>
                    <Td>
                      <div className="flex flex-col items-start gap-1">
                        <Selo tom={s.tom}>{s.rotulo}</Selo>
                        {n.total > 0 && (
                          <span className="text-xs whitespace-nowrap text-ink-3 tabular">
                            {plural(n.total, 'consulta')} · {n.aSeguir} a seguir
                          </span>
                        )}
                      </div>
                    </Td>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        </Cartao>
      )}
    </Pagina>
  )
}
