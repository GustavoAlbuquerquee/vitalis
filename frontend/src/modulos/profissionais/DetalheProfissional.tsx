import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { BedDouble, CalendarDays, CalendarOff, CalendarPlus, ChevronLeft, ChevronRight, Clock, Pencil, Plus } from 'lucide-react'
import {
  Alerta,
  Avatar,
  Botao,
  BotaoIcone,
  BotaoLink,
  CabecalhoCartao,
  CabecalhoPagina,
  Campo,
  Cartao,
  CorpoCartao,
  Entrada,
  EstadoVazio,
  ListaDefinicao,
  Modal,
  Pagina,
  Selecao,
  usePrototipo,
} from '@/ds'
import { Horario, Pessoa, SeloConsulta, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, buscarQuarto, listarConsultas, listarInternacoes } from '@/api'
import { conflitaCom } from '@/dominio/regras'
import { hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diaDaSemana, formatarDataLonga, formatarTelefone, plural, relativo } from '@/lib/formato'
import { diasSemana, especialidades } from '@/lib/rotulos'
import type { DiaSemana, Disponibilidade, ProfissionalSaude } from '@/tipos/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import { cn } from '@/lib/cn'

/** "às segundas", "aos sábados" */
const nosDias = (d: (typeof diasSemana)[number]) => `${d.valor === 'SABADO' || d.valor === 'DOMINGO' ? 'aos' : 'às'} ${d.rotulo.toLowerCase()}s`

const janelasDoDia = (p: ProfissionalSaude, dia: DiaSemana) =>
  p.disponibilidades.filter((j) => j.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

export function DetalheProfissional() {
  const { id } = useParams()
  const profissional = buscarProfissional(Number(id))
  if (!profissional) return <NaoEncontrada titulo="Profissional não encontrado" voltarPara="/profissionais" voltarRotulo="Voltar aos profissionais" />
  return <Ficha key={profissional.id} p={profissional} />
}

function Ficha({ p }: { p: ProfissionalSaude }) {
  const dia = hoje()

  const realizadas30 = listarConsultas({ profissionalId: p.id, status: 'REALIZADA' }).filter((c) => c.data >= somarDias(dia, -30) && c.data <= dia).length
  const agendadas7 = listarConsultas({ profissionalId: p.id, status: 'AGENDADA' }).filter((c) => c.data >= dia && c.data <= somarDias(dia, 7)).length
  const internacoes = listarInternacoes({ status: 'ATIVA' }).filter((i) => i.profissionalId === p.id)

  const numeros = [
    { rotulo: 'Consultas realizadas', detalhe: 'Últimos 30 dias', valor: realizadas30 },
    { rotulo: 'Consultas agendadas', detalhe: 'Próximos 7 dias', valor: agendadas7 },
    { rotulo: 'Internações ativas', detalhe: 'Sob responsabilidade', valor: internacoes.length },
  ]

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Profissionais', para: '/profissionais' }, { rotulo: p.nome }]}
        antes={<Avatar nome={p.nome} tamanho="xl" />}
        titulo={p.nome}
        descricao={
          <span className="flex flex-wrap items-center gap-x-2">
            {nomeEspecialidade(p)}
            <span className="text-ink-3" aria-hidden>·</span>
            <span className="font-mono text-sm tabular">{p.registroProfissional}</span>
          </span>
        }
        acoes={
          <>
            <BotaoLink to={`/profissionais/${p.id}/editar`} icone={<Pencil />}>
              Editar
            </BotaoLink>
            <BotaoLink to={`/consultas/nova?profissionalId=${p.id}`} variante="primario" icone={<CalendarPlus />}>
              Agendar consulta
            </BotaoLink>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AgendaDoDia p={p} />
          <DisponibilidadeSemanal p={p} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Cartao>
            <CabecalhoCartao titulo="Contato" />
            <CorpoCartao>
              <ListaDefinicao
                colunas={1}
                itens={[
                  {
                    rotulo: 'Telefone',
                    valor: (
                      <a href={`tel:+55${p.telefone.replace(/\D/g, '')}`} className="tabular hover:underline hover:underline-offset-4">
                        {formatarTelefone(p.telefone)}
                      </a>
                    ),
                  },
                  {
                    rotulo: 'E-mail',
                    valor: (
                      <a href={`mailto:${p.email}`} className="hover:underline hover:underline-offset-4">
                        {p.email}
                      </a>
                    ),
                  },
                  { rotulo: `Registro profissional (${especialidades[p.especialidade].conselho})`, valor: p.registroProfissional, mono: true },
                ]}
              />
            </CorpoCartao>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Números" />
            <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
              {numeros.map((n) => (
                <div key={n.rotulo} className="flex min-w-0 flex-col px-4 py-4 first:pl-5 last:pr-5">
                  <dt className="order-2 mt-1 text-xs leading-tight font-medium text-ink-2">
                    {n.rotulo}
                    <span className="mt-0.5 block text-2xs font-normal text-ink-3">{n.detalhe}</span>
                  </dt>
                  <dd className="order-1 text-xl font-semibold tracking-[-0.02em] tabular">{n.valor}</dd>
                </div>
              ))}
            </dl>
            <div className="px-5 pt-4 pb-1">
              <h3 className="flex items-center gap-2 text-sm font-medium text-ink-2">
                <BedDouble className="size-4 text-ink-3" aria-hidden />
                Internações sob responsabilidade
              </h3>
            </div>
            {internacoes.length === 0 ? (
              <p className="px-5 pt-1 pb-5 text-sm text-ink-3">Nenhuma internação ativa sob responsabilidade deste profissional.</p>
            ) : (
              <ul className="divide-y divide-line pb-1">
                {internacoes.map((i) => {
                  const paciente = buscarPaciente(i.pacienteId)!
                  const quarto = buscarQuarto(i.quartoId)!
                  return (
                    <li key={i.id}>
                      <Link to={`/internacoes/${i.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60">
                        <Pessoa nome={paciente.nome} tamanho="sm" detalhe={`Quarto ${quarto.numero} · ${i.motivo}`} className="flex-1" />
                        <span className="shrink-0 text-sm text-ink-3 tabular">{plural(diasInternado(i), 'dia')}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Cartao>
        </div>
      </div>
    </Pagina>
  )
}

function AgendaDoDia({ p }: { p: ProfissionalSaude }) {
  const [dia, setDia] = useState(hoje)
  const semana = diasSemana[indiceDiaSemana(dia)]
  const janelas = janelasDoDia(p, semana.valor)
  const consultas = listarConsultas({ profissionalId: p.id, data: dia })
  const ativas = consultas.filter((c) => c.status !== 'CANCELADA').length

  return (
    <Cartao>
      <CabecalhoCartao
        titulo="Agenda do dia"
        descricao={
          <span className="first-letter:uppercase">
            {diaDaSemana(dia)}, {formatarDataLonga(dia)} · {relativo(dia)}
          </span>
        }
        acoes={
          <>
            <BotaoIcone rotulo="Dia anterior" tamanho="sm" onClick={() => setDia((d) => somarDias(d, -1))}>
              <ChevronLeft />
            </BotaoIcone>
            <Botao tamanho="sm" onClick={() => setDia(hoje())} disabled={dia === hoje()}>
              Hoje
            </Botao>
            <BotaoIcone rotulo="Próximo dia" tamanho="sm" onClick={() => setDia((d) => somarDias(d, 1))}>
              <ChevronRight />
            </BotaoIcone>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-surface-2/40 px-5 py-2.5 text-sm text-ink-2">
        <Clock className="size-4 shrink-0 text-ink-3" aria-hidden />
        {janelas.length ? (
          <>
            <span>
              Atende{' '}
              {janelas.map((j, i) => (
                <span key={j.id}>
                  {i > 0 && ' e '}
                  <span className="font-mono text-xs tabular">
                    {j.horaInicio}–{j.horaFim}
                  </span>
                </span>
              ))}
            </span>
            <span className="text-ink-3 tabular">· {plural(ativas, 'consulta')}</span>
          </>
        ) : (
          <span>Não atende {nosDias(semana)} — sem janela de disponibilidade neste dia da semana.</span>
        )}
      </div>

      {consultas.length === 0 ? (
        janelas.length ? (
          <EstadoVazio
            icone={<CalendarDays />}
            titulo="Nenhuma consulta neste dia"
            descricao="A agenda está livre nas janelas de disponibilidade."
            acao={
              dia >= hoje() && (
                <BotaoLink to={`/consultas/nova?profissionalId=${p.id}&data=${dia}`} tamanho="sm" icone={<CalendarPlus />}>
                  Agendar consulta
                </BotaoLink>
              )
            }
          />
        ) : (
          <EstadoVazio icone={<CalendarOff />} titulo={`Não atende ${nosDias(semana)}`} descricao="Escolha outro dia ou adicione uma janela de disponibilidade para este dia da semana." />
        )
      ) : (
        <ul className="divide-y divide-line">
          {consultas.map((c) => {
            const paciente = buscarPaciente(c.pacienteId)!
            return (
              <li key={c.id} className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors hover:bg-surface-2/60">
                {/* Link da linha inteira por baixo; o nome do paciente fica por cima com o próprio link */}
                <Link to={`/consultas/${c.id}`} className="absolute inset-0" aria-label={`Consulta das ${c.horario} com ${paciente.nome}`} />
                <Horario c={c} className={cn('w-[104px] shrink-0', c.status === 'CANCELADA' && 'text-ink-3 line-through')} />
                <Pessoa
                  nome={paciente.nome}
                  para={`/pacientes/${paciente.id}`}
                  detalhe={c.motivo}
                  className="order-last w-full sm:order-none sm:w-auto sm:flex-1 [&_a]:relative [&_a]:z-10"
                />
                <span className="ml-auto sm:ml-0">
                  <SeloConsulta status={c.status} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Cartao>
  )
}

/* Grade semanal: 07h às 19h, uma coluna por dia */
const HORA_INICIO = 7
const HORA_FIM = 19
const ALTURA_HORA = 36

function DisponibilidadeSemanal({ p }: { p: ProfissionalSaude }) {
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), [])
  const indiceHoje = indiceDiaSemana(hoje())
  const horas = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i)
  const totalMinutos = p.disponibilidades.reduce((s, j) => s + minutos(j.horaFim) - minutos(j.horaInicio), 0)
  const diasComJanela = diasSemana.filter((d) => p.disponibilidades.some((j) => j.diaSemana === d.valor)).length

  const posicao = (j: Disponibilidade) => {
    const ini = Math.max(minutos(j.horaInicio), HORA_INICIO * 60)
    const fim = Math.min(minutos(j.horaFim), HORA_FIM * 60)
    return { top: ((ini - HORA_INICIO * 60) / 60) * ALTURA_HORA, height: Math.max(((fim - ini) / 60) * ALTURA_HORA, 18) }
  }

  return (
    <Cartao>
      <CabecalhoCartao
        titulo="Disponibilidade semanal"
        descricao={
          p.disponibilidades.length
            ? `${plural(p.disponibilidades.length, 'janela')} em ${plural(diasComJanela, 'dia')} · ${Math.round((totalMinutos / 60) * 10) / 10}h por semana`
            : 'Nenhuma janela cadastrada'
        }
        acoes={
          <Botao tamanho="sm" icone={<Plus />} onClick={() => setAberto(true)}>
            <span className="sr-only sm:not-sr-only">Adicionar janela</span>
          </Botao>
        }
      />
      <div className="overflow-x-auto px-5 py-4">
        <div className="grid min-w-[600px] grid-cols-[44px_repeat(7,minmax(0,1fr))]">
          <div />
          {diasSemana.map((d, i) => (
            <div key={d.valor} className={cn('pb-2 text-center text-xs font-medium', i === indiceHoje ? 'text-brand-ink' : 'text-ink-3')}>
              {d.curto}
              {i === indiceHoje && <span className="sr-only"> (hoje)</span>}
            </div>
          ))}

          <div className="relative" style={{ height: (HORA_FIM - HORA_INICIO) * ALTURA_HORA }} aria-hidden>
            {horas.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 font-mono text-2xs text-ink-3 tabular" style={{ top: (h - HORA_INICIO) * ALTURA_HORA }}>
                {String(h).padStart(2, '0')}h
              </span>
            ))}
          </div>

          {diasSemana.map((d, i) => (
            <div key={d.valor} className={cn('relative border-l border-line', i === 6 && 'border-r', i === indiceHoje && 'bg-surface-2/50')}>
              {horas.slice(0, -1).map((h) => (
                <div key={h} className="border-t border-line/70" style={{ height: ALTURA_HORA }} aria-hidden />
              ))}
              <div className="absolute inset-x-0 bottom-0 border-t border-line/70" aria-hidden />
              {janelasDoDia(p, d.valor).map((j) => (
                <div
                  key={j.id}
                  title={`${d.rotulo}, ${j.horaInicio} às ${j.horaFim}`}
                  className="absolute inset-x-1 overflow-hidden rounded-[5px] border-l-[3px] border-brand bg-brand-soft px-1.5 py-1 text-2xs leading-tight font-medium text-brand-ink tabular"
                  style={posicao(j)}
                >
                  <span className="sr-only">{d.rotulo}, </span>
                  {j.horaInicio}–<wbr />
                  {j.horaFim}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Montado só quando aberto: o formulário recomeça limpo a cada abertura */}
      {aberto && <NovaJanela p={p} aoFechar={fechar} />}
    </Cartao>
  )
}

function NovaJanela({ p, aoFechar }: { p: ProfissionalSaude; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const formId = useId()
  const [dia, setDia] = useState<DiaSemana>('SEGUNDA')
  const [inicio, setInicio] = useState('08:00')
  const [fim, setFim] = useState('12:00')

  const completo = Boolean(inicio && fim)
  const invertido = completo && minutos(fim) <= minutos(inicio)
  const sobrepostas =
    completo && !invertido
      ? janelasDoDia(p, dia).filter((j) =>
          conflitaCom({ inicio: minutos(inicio), fim: minutos(fim) }, { inicio: minutos(j.horaInicio), fim: minutos(j.horaFim) }),
        )
      : []
  const valido = completo && !invertido && sobrepostas.length === 0
  const rotuloDia = diasSemana.find((d) => d.valor === dia)!

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!valido) return
    prototipo('Janela de disponibilidade adicionada')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Adicionar janela de disponibilidade"
      descricao={`Horário em que ${p.nome} atende, toda semana.`}
      rodape={
        <>
          <Botao variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao variante="primario" type="submit" form={formId} disabled={!valido}>
            Adicionar janela
          </Botao>
        </>
      }
    >
      <form id={formId} onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo rotulo="Dia da semana" obrigatorio className="sm:col-span-3">
            {(props) => (
              <Selecao {...props} value={dia} onChange={(e) => setDia(e.target.value as DiaSemana)}>
                {diasSemana.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.rotulo}
                  </option>
                ))}
              </Selecao>
            )}
          </Campo>
          <Campo rotulo="Início" obrigatorio erro={!inicio ? 'Informe o horário de início' : undefined} className="sm:col-span-1">
            {(props) => <Entrada {...props} type="time" mono value={inicio} onChange={(e) => setInicio(e.target.value)} />}
          </Campo>
          <Campo rotulo="Fim" obrigatorio erro={!fim ? 'Informe o horário de fim' : invertido ? 'O fim precisa ser depois do início' : undefined} className="sm:col-span-1">
            {(props) => <Entrada {...props} type="time" mono value={fim} onChange={(e) => setFim(e.target.value)} />}
          </Campo>
        </div>

        {sobrepostas.length > 0 && (
          <Alerta tom="warn" titulo="Sobrepõe uma janela existente">
            {rotuloDia.rotulo} já tem janela das {sobrepostas.map((j) => `${j.horaInicio} às ${j.horaFim}`).join(' e das ')}. Duas janelas do mesmo profissional não podem se sobrepor no mesmo dia.
          </Alerta>
        )}
      </form>
    </Modal>
  )
}
