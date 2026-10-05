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
} from '@/ds'
import { Horario, Pessoa, SeloConsulta, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, listarConsultas, listarProfissionais } from '@/api'
import { hhmm, hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diaDaSemana, formatarDataLonga, plural, relativo } from '@/lib/formato'
import { diasSemana, especialidades, statusConsulta } from '@/lib/rotulos'
import type { Consulta, Especialidade, StatusConsulta } from '@/tipos/dominio'
import { cn } from '@/lib/cn'
import s from './Agenda.module.css'

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
    <Pagina larga>
      <CabecalhoPagina
        titulo="Agenda"
        descricao={`${plural(consultas.length, 'consulta')} em ${formatarDataLonga(data)} · ${agendadas} a realizar`}
        acoes={
          <BotaoLink to={`/consultas/nova${data !== hoje() ? `?data=${data}` : ''}`} variante="primario" icone={<CalendarPlus />}>
            Agendar consulta
          </BotaoLink>
        }
      />

      <div className={s.barra}>
        <div className={s.grupo}>
          <div className={s.setas}>
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
          <label className={s.seletorData}>
            <span className={cn('inicial-maiuscula', s.dataTitulo)}>
              {diaDaSemana(data)}, <span>{formatarDataLonga(data).replace(/ de \d{4}$/, '')}</span>
            </span>
            {data !== hoje() && <span className={s.relativo}>· {relativo(data)}</span>}
            <CalendarDays className={s.iconeData} aria-hidden />
            <input
              type="date"
              value={data}
              onChange={(e) => e.target.value && irPara(e.target.value)}
              aria-label="Escolher data"
              className={s.entradaData}
            />
          </label>
        </div>
        <div className={s.grupo}>
          <Selecao value={especialidade} onChange={(e) => setEspecialidade(e.target.value as Especialidade | '')} aria-label="Filtrar por especialidade">
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
    <Cartao className={s.recorte}>
      <div ref={rolagem} className={s.rolagem}>
        <div className={s.grade} style={{ gridTemplateColumns: `64px repeat(${colunas.length}, minmax(176px, 1fr))` }}>
          {/* Cabeçalho fixo */}
          <div className={s.canto} />
          {colunas.map((p) => {
            const doDia = consultas.filter((c) => c.profissionalId === p.id && c.status !== 'CANCELADA')
            return (
              <Link
                key={p.id}
                to={`/profissionais/${p.id}`}
                className={s.cabecalhoProf}
              >
                <Avatar nome={p.nome} tamanho="sm" />
                <div className={s.profTexto}>
                  <p className={s.profNome}>{p.nome}</p>
                  <p className={s.profDetalhe}>
                    {nomeEspecialidade(p)} · {doDia.length}
                  </p>
                </div>
              </Link>
            )
          })}

          {/* Régua de horas */}
          <div className={s.regua} style={{ height: altura }}>
            {horas.map((h) => (
              <span key={h} className={s.hora} style={{ top: (h - INICIO) * PX_POR_MIN }}>
                {h === INICIO ? '' : hhmm(h)}
              </span>
            ))}
            {mostrarAgora && (
              <span
                className={s.agora}
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
                className={s.coluna}
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
                      className={s.janela}
                      style={{ top: (ini - INICIO) * PX_POR_MIN, height: (fim - ini) * PX_POR_MIN }}
                    />
                  )
                })}
                {/* Linhas de hora */}
                {horas.slice(1).map((h) => (
                  <div key={h} className={s.linhaHora} style={{ top: (h - INICIO) * PX_POR_MIN }} />
                ))}
                {mostrarAgora && <div className={s.linhaAgora} style={{ top: (agora - INICIO) * PX_POR_MIN - 1 }} aria-hidden />}
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
  const curto = altura < 34
  return (
    <Link
      to={`/consultas/${c.id}`}
      title={`${c.horario} · ${paciente.nome} — ${c.motivo} (${statusConsulta[c.status].rotulo})`}
      data-tom={statusConsulta[c.status].tom}
      className={cn(s.bloco, curto && s.blocoCurto, c.status === 'CANCELADA' && s.blocoCancelado)}
      style={{ top: (ini - INICIO) * PX_POR_MIN + 1, height: altura }}
    >
      <span className={s.blocoHorario}>{c.horario}</span>
      <p className={s.blocoPaciente}>{paciente.nome}</p>
      {!curto && altura > 48 && <p className={s.blocoMotivo}>{c.motivo}</p>}
    </Link>
  )
}

function Legenda() {
  return (
    <div className={s.legenda}>
      {(Object.keys(statusConsulta) as StatusConsulta[]).map((st) => (
        <span key={st} className={s.legendaItem}>
          <span data-tom={statusConsulta[st].tom} className={s.legendaPonto} />
          {statusConsulta[st].rotulo}
        </span>
      ))}
      <span className={s.legendaItem}>
        <span className={s.legendaHachura} />
        Fora da disponibilidade
      </span>
      <span className={s.legendaDica}>Clique num horário livre para agendar</span>
    </div>
  )
}

/* ───────────────────────── Lista ───────────────────────── */

function ListaDoDia({ consultas }: { consultas: Consulta[] }) {
  const [status, setStatus] = useState<StatusConsulta | 'TODAS'>('TODAS')
  const visiveis = consultas.filter((c) => status === 'TODAS' || c.status === status)
  const contar = (st: StatusConsulta) => consultas.filter((c) => c.status === st).length

  return (
    <>
      <Pilulas<StatusConsulta | 'TODAS'>
        rotulo="Filtrar por status"
        className={s.pilulas}
        valor={status}
        aoMudar={setStatus}
        opcoes={[
          { valor: 'TODAS', rotulo: 'Todas', contagem: consultas.length },
          ...(Object.keys(statusConsulta) as StatusConsulta[]).map((st) => ({ valor: st, rotulo: statusConsulta[st].rotulo, contagem: contar(st) })),
        ]}
      />
      <Cartao className={s.recorte}>
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
                    <Td className={s.semQuebra}>
                      <Horario c={c} />
                    </Td>
                    <Td className={s.colPaciente}>
                      <Pessoa nome={paciente.nome} para={`/pacientes/${paciente.id}`} tamanho="sm" />
                    </Td>
                    <Td className={s.colProfissional}>
                      <p className={s.listaProfNome}>{prof.nome}</p>
                      <p className={s.listaProfEsp}>{nomeEspecialidade(prof)}</p>
                    </Td>
                    <Td className={s.colMotivo}>{c.motivo}</Td>
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
