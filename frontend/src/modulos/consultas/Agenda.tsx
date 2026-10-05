import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Columns3, List } from 'lucide-react'
import {
  Avatar,
  Botao,
  BotaoIcone,
  BotaoLink,
  CabecalhoPagina,
  Cartao,
  EstadoVazio,
  Linha,
  Pagina,
  Pilulas,
  Segmentado,
  Selecao,
  Tabela,
  Td,
  Th,
  tons,
} from '@/ds'
import { Horario, Pessoa, SeloConsulta, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, listarConsultas, listarProfissionais } from '@/api'
import { hhmm, hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diaDaSemana, formatarDataLonga, plural, relativo } from '@/lib/formato'
import { diasSemana, especialidades, statusConsulta } from '@/lib/rotulos'
import type { Consulta, Especialidade, StatusConsulta } from '@/tipos/dominio'
import { cn } from '@/lib/cn'

type Visao = 'dia' | 'lista'

const INICIO = 7 * 60
const FIM = 20 * 60
const PX_POR_MIN = 1.1

export function Agenda() {
  const [params, setParams] = useSearchParams()
  const data = params.get('data') ?? hoje()
  const visao: Visao = params.get('visao') === 'lista' ? 'lista' : 'dia'
  const [especialidade, setEspecialidade] = useState<Especialidade | ''>('')

  const atualizar = (mudancas: Record<string, string | null>) => {
    const novo = new URLSearchParams(params)
    Object.entries(mudancas).forEach(([k, v]) => (v === null ? novo.delete(k) : novo.set(k, v)))
    setParams(novo, { replace: true })
  }
  const irPara = (d: string) => atualizar({ data: d === hoje() ? null : d })

  const consultas = listarConsultas({ data }).filter((c) => !especialidade || buscarProfissional(c.profissionalId)?.especialidade === especialidade)
  const agendadas = consultas.filter((c) => c.status === 'AGENDADA').length

  return (
    <Pagina className="max-w-none">
      <CabecalhoPagina
        titulo="Agenda"
        descricao={`${plural(consultas.length, 'consulta')} em ${formatarDataLonga(data)} · ${agendadas} a realizar`}
        acoes={
          <BotaoLink to={`/consultas/nova${data !== hoje() ? `?data=${data}` : ''}`} variante="primario" icone={<CalendarPlus />}>
            Agendar consulta
          </BotaoLink>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <BotaoIcone rotulo="Dia anterior" onClick={() => irPara(somarDias(data, -1))}>
              <ChevronLeft />
            </BotaoIcone>
            <BotaoIcone rotulo="Próximo dia" onClick={() => irPara(somarDias(data, 1))}>
              <ChevronRight />
            </BotaoIcone>
          </div>
          <Botao tamanho="sm" onClick={() => irPara(hoje())} disabled={data === hoje()}>
            Hoje
          </Botao>
          <label className="relative ml-1 flex items-center gap-2 rounded-control px-2 py-1 hover:bg-surface-2">
            <span className="inline-block text-md font-semibold first-letter:uppercase">
              {diaDaSemana(data)}, <span>{formatarDataLonga(data).replace(/ de \d{4}$/, '')}</span>
            </span>
            {data !== hoje() && <span className="text-sm text-ink-3">· {relativo(data)}</span>}
            <CalendarDays className="size-4 text-ink-3" aria-hidden />
            <input
              type="date"
              value={data}
              onChange={(e) => e.target.value && irPara(e.target.value)}
              aria-label="Escolher data"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Selecao value={especialidade} onChange={(e) => setEspecialidade(e.target.value as Especialidade | '')} aria-label="Filtrar por especialidade" className="w-48">
            <option value="">Todas as especialidades</option>
            {Object.entries(especialidades).map(([k, v]) => (
              <option key={k} value={k}>
                {v.rotulo}
              </option>
            ))}
          </Selecao>
          <Segmentado<Visao>
            rotulo="Modo de visualização"
            valor={visao}
            aoMudar={(v) => atualizar({ visao: v === 'dia' ? null : v })}
            opcoes={[
              { valor: 'dia', rotulo: <><Columns3 /> Grade</> },
              { valor: 'lista', rotulo: <><List /> Lista</> },
            ]}
          />
        </div>
      </div>

      {visao === 'dia' ? <GradeDoDia data={data} consultas={consultas} especialidade={especialidade} /> : <ListaDoDia consultas={consultas} />}
    </Pagina>
  )
}

/* ───────────────────────── Grade: profissionais × horários ───────────────────────── */

function GradeDoDia({ data, consultas, especialidade }: { data: string; consultas: Consulta[]; especialidade: Especialidade | '' }) {
  const navegar = useNavigate()
  const rolagem = useRef<HTMLDivElement>(null)
  const dia = diasSemana[indiceDiaSemana(data)].valor
  const ehHoje = data === hoje()
  const [agora, setAgora] = useState(() => new Date().getHours() * 60 + new Date().getMinutes())

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date().getHours() * 60 + new Date().getMinutes()), 60_000)
    return () => clearInterval(t)
  }, [])

  const colunas = useMemo(
    () =>
      listarProfissionais().filter(
        (p) =>
          (!especialidade || p.especialidade === especialidade) &&
          (p.disponibilidades.some((j) => j.diaSemana === dia) || consultas.some((c) => c.profissionalId === p.id)),
      ),
    [dia, consultas, especialidade],
  )

  // Abre a grade perto da hora atual
  useEffect(() => {
    if (ehHoje && rolagem.current) rolagem.current.scrollTop = Math.max(0, (agora - INICIO - 60) * PX_POR_MIN)
  }, [data])

  if (colunas.length === 0)
    return (
      <Cartao>
        <EstadoVazio icone={<CalendarDays />} titulo="Nenhum profissional atende neste dia" descricao="Escolha outra data ou outra especialidade." />
      </Cartao>
    )

  const mostrarAgora = ehHoje && agora >= INICIO && agora <= FIM
  const horas = Array.from({ length: (FIM - INICIO) / 60 + 1 }, (_, i) => INICIO + i * 60)
  const altura = (FIM - INICIO) * PX_POR_MIN

  return (
    <Cartao className="overflow-hidden">
      <div ref={rolagem} className="max-h-[calc(100dvh-260px)] min-h-[420px] overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: `64px repeat(${colunas.length}, minmax(176px, 1fr))` }}>
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 left-0 z-30 border-r border-b border-line bg-surface" />
          {colunas.map((p) => {
            const doDia = consultas.filter((c) => c.profissionalId === p.id && c.status !== 'CANCELADA')
            return (
              <Link
                key={p.id}
                to={`/profissionais/${p.id}`}
                className="sticky top-0 z-20 flex items-center gap-2.5 border-r border-b border-line bg-surface px-3 py-2.5 last:border-r-0 hover:bg-surface-2"
              >
                <Avatar nome={p.nome} tamanho="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold">{p.nome}</p>
                  <p className="truncate text-xs text-ink-3">
                    {nomeEspecialidade(p)} · {doDia.length}
                  </p>
                </div>
              </Link>
            )
          })}

          {/* Régua de horas */}
          <div className="sticky left-0 z-10 border-r border-line bg-surface" style={{ height: altura }}>
            {horas.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 font-mono text-2xs text-ink-3 tabular" style={{ top: (h - INICIO) * PX_POR_MIN }}>
                {h === INICIO ? '' : hhmm(h)}
              </span>
            ))}
            {mostrarAgora && (
              <span
                className="absolute right-1 z-[1] -translate-y-1/2 rounded bg-danger px-1 font-mono text-2xs font-semibold text-white tabular dark:text-[#2a0a0c]"
                style={{ top: (agora - INICIO) * PX_POR_MIN }}
              >
                {hhmm(agora)}
              </span>
            )}
          </div>

          {/* Colunas */}
          {colunas.map((p) => {
            const janelas = p.disponibilidades.filter((j) => j.diaSemana === dia)
            return (
              <div
                key={p.id}
                className="relative border-r border-line bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--surface-2)_6px_7px)] last:border-r-0"
                style={{ height: altura }}
              >
                {/* Janelas de disponibilidade: o que não é janela fica hachurado */}
                {janelas.map((j) => {
                  const ini = minutos(j.horaInicio)
                  const fim = minutos(j.horaFim)
                  return (
                    <button
                      key={j.id}
                      aria-label={`Agendar com ${p.nome} entre ${j.horaInicio} e ${j.horaFim}`}
                      onClick={(e) => {
                        const y = e.clientY - e.currentTarget.getBoundingClientRect().top
                        const slot = Math.min(fim - 30, ini + Math.floor(y / PX_POR_MIN / 30) * 30)
                        navegar(`/consultas/nova?profissionalId=${p.id}&data=${data}&horario=${hhmm(slot)}`)
                      }}
                      className="absolute inset-x-0 cursor-copy bg-surface transition-colors hover:bg-brand-soft/40"
                      style={{ top: (ini - INICIO) * PX_POR_MIN, height: (fim - ini) * PX_POR_MIN }}
                    />
                  )
                })}
                {/* Linhas de hora */}
                {horas.slice(1).map((h) => (
                  <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line/70" style={{ top: (h - INICIO) * PX_POR_MIN }} />
                ))}
                {mostrarAgora && <div className="pointer-events-none absolute inset-x-0 z-[6] h-0.5 bg-danger" style={{ top: (agora - INICIO) * PX_POR_MIN - 1 }} aria-hidden />}
                {consultas
                  .filter((c) => c.profissionalId === p.id)
                  .map((c) => (
                    <BlocoConsulta key={c.id} c={c} />
                  ))}
              </div>
            )
          })}
        </div>

      </div>
      <Legenda />
    </Cartao>
  )
}

function BlocoConsulta({ c }: { c: Consulta }) {
  const paciente = buscarPaciente(c.pacienteId)!
  const ini = minutos(c.horario)
  const altura = c.duracaoMinutos * PX_POR_MIN - 3
  const t = tons[statusConsulta[c.status].tom]
  const curto = altura < 34
  return (
    <Link
      to={`/consultas/${c.id}`}
      title={`${c.horario} · ${paciente.nome} — ${c.motivo} (${statusConsulta[c.status].rotulo})`}
      className={cn(
        'absolute inset-x-1 z-[5] overflow-hidden rounded-[6px] border-l-[3px] px-2 transition-[filter,box-shadow] hover:shadow-pop hover:brightness-[0.98]',
        t.suave,
        t.borda,
        curto ? 'flex items-center gap-1.5 py-0' : 'py-1',
        c.status === 'CANCELADA' && 'opacity-60',
      )}
      style={{ top: (ini - INICIO) * PX_POR_MIN + 1, height: altura }}
    >
      <span className={cn('font-mono text-2xs tabular', t.texto)}>{c.horario}</span>
      <p className={cn('truncate text-xs font-semibold text-ink', c.status === 'CANCELADA' && 'line-through')}>{paciente.nome}</p>
      {!curto && altura > 48 && <p className="truncate text-2xs text-ink-2">{c.motivo}</p>}
    </Link>
  )
}

function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-2.5 text-xs text-ink-3">
      {(Object.keys(statusConsulta) as StatusConsulta[]).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={cn('h-3 w-1 rounded-full', tons[statusConsulta[s].tom].ponto)} />
          {statusConsulta[s].rotulo}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm border border-line bg-[repeating-linear-gradient(135deg,transparent_0_3px,var(--line-strong)_3px_4px)]" />
        Fora da disponibilidade
      </span>
      <span className="ml-auto hidden sm:inline">Clique num horário livre para agendar</span>
    </div>
  )
}

/* ───────────────────────── Lista ───────────────────────── */

function ListaDoDia({ consultas }: { consultas: Consulta[] }) {
  const [status, setStatus] = useState<StatusConsulta | 'TODAS'>('TODAS')
  const visiveis = consultas.filter((c) => status === 'TODAS' || c.status === status)
  const contar = (s: StatusConsulta) => consultas.filter((c) => c.status === s).length

  return (
    <>
      <Pilulas<StatusConsulta | 'TODAS'>
        rotulo="Filtrar por status"
        className="mb-4"
        valor={status}
        aoMudar={setStatus}
        opcoes={[
          { valor: 'TODAS', rotulo: 'Todas', contagem: consultas.length },
          ...(Object.keys(statusConsulta) as StatusConsulta[]).map((s) => ({ valor: s, rotulo: statusConsulta[s].rotulo, contagem: contar(s) })),
        ]}
      />
      <Cartao className="overflow-hidden">
        {visiveis.length === 0 ? (
          <EstadoVazio icone={<CalendarDays />} titulo="Nenhuma consulta" descricao="Não há consultas com esse filtro neste dia." />
        ) : (
          <Tabela>
            <thead>
              <tr>
                <Th>Horário</Th>
                <Th>Paciente</Th>
                <Th>Profissional</Th>
                <Th>Motivo</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((c) => {
                const paciente = buscarPaciente(c.pacienteId)!
                const prof = buscarProfissional(c.profissionalId)!
                return (
                  <Linha key={c.id} para={`/consultas/${c.id}`}>
                    <Td className="whitespace-nowrap">
                      <Horario c={c} />
                    </Td>
                    <Td className="min-w-[220px]">
                      <Pessoa nome={paciente.nome} para={`/pacientes/${paciente.id}`} tamanho="sm" />
                    </Td>
                    <Td className="min-w-[200px]">
                      <p className="text-ink">{prof.nome}</p>
                      <p className="text-sm text-ink-3">{nomeEspecialidade(prof)}</p>
                    </Td>
                    <Td className="max-w-[320px] min-w-[200px] truncate text-ink-2">{c.motivo}</Td>
                    <Td>
                      <SeloConsulta status={c.status} />
                    </Td>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        )}
      </Cartao>
    </>
  )
}
