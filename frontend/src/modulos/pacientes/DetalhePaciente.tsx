import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { BedDouble, CalendarDays, CalendarPlus, ChevronDown, FileClock, Pencil, Stethoscope } from 'lucide-react'
import {
  Abas,
  Alerta,
  Avatar,
  BotaoLink,
  CabecalhoCartao,
  CabecalhoPagina,
  Cartao,
  CorpoCartao,
  EstadoVazio,
  ListaDefinicao,
  Pagina,
  Pilulas,
  Selo,
} from '@/ds'
import { Horario, RegistrosClinicos, SeloConsulta, SeloInternacao, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import {
  buscarPaciente,
  buscarProfissional,
  buscarQuarto,
  historicoDoPaciente,
  internacaoAtivaDoPaciente,
  listarConsultas,
  type EventoHistorico,
} from '@/api'
import { hoje, idade } from '@/lib/datas'
import {
  diaDaSemanaCurto,
  formatarCep,
  formatarCpf,
  formatarData,
  formatarDataLonga,
  formatarTelefone,
  plural,
  relativo,
} from '@/lib/formato'
import { cn } from '@/lib/cn'

type Aba = 'geral' | 'historico'

export function DetalhePaciente() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const paciente = buscarPaciente(Number(id))
  if (!paciente) return <NaoEncontrada titulo="Paciente não encontrado" voltarPara="/pacientes" voltarRotulo="Voltar aos pacientes" />

  const aba: Aba = params.get('aba') === 'historico' ? 'historico' : 'geral'
  const historico = historicoDoPaciente(paciente.id)
  const internacao = internacaoAtivaDoPaciente(paciente.id)

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Pacientes', para: '/pacientes' }, { rotulo: paciente.nome }]}
        antes={<Avatar nome={paciente.nome} tamanho="xl" className="hidden sm:inline-flex" />}
        titulo={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {paciente.nome}
            {internacao && <Selo tom="brand">Internado</Selo>}
            {!paciente.ativo && <Selo tom="neutral">Desativado</Selo>}
          </span>
        }
        descricao={
          <span className="flex flex-wrap gap-x-2 text-ink-2">
            <span className="font-mono text-sm tabular">{formatarCpf(paciente.cpf)}</span>
            <span className="text-ink-3">·</span>
            {idade(paciente.dataNascimento)} anos
            <span className="text-ink-3">·</span>
            {paciente.endereco.cidade}/{paciente.endereco.uf}
          </span>
        }
        acoes={
          <>
            <BotaoLink to={`/pacientes/${paciente.id}/editar`} icone={<Pencil />}>
              Editar
            </BotaoLink>
            {!internacao && (
              <BotaoLink to={`/internacoes/nova?pacienteId=${paciente.id}`} icone={<BedDouble />}>
                Internar
              </BotaoLink>
            )}
            <BotaoLink to={`/consultas/nova?pacienteId=${paciente.id}`} variante="primario" icone={<CalendarPlus />}>
              Agendar consulta
            </BotaoLink>
          </>
        }
      />

      <Abas<Aba>
        rotulo="Seções do paciente"
        className="mb-6"
        valor={aba}
        aoMudar={(a) => setParams(a === 'geral' ? {} : { aba: a }, { replace: true })}
        opcoes={[
          { valor: 'geral', rotulo: 'Visão geral' },
          { valor: 'historico', rotulo: 'Histórico médico', contagem: historico.length },
        ]}
      />

      {aba === 'geral' ? <VisaoGeral pacienteId={paciente.id} /> : <Historico eventos={historico} />}
    </Pagina>
  )
}

function VisaoGeral({ pacienteId }: { pacienteId: number }) {
  const p = buscarPaciente(pacienteId)!
  const internacao = internacaoAtivaDoPaciente(p.id)
  const consultas = listarConsultas({ pacienteId: p.id })
  const proximas = consultas.filter((c) => c.status === 'AGENDADA' && c.data >= hoje())
  const realizadas = consultas.filter((c) => c.status === 'REALIZADA')
  const historico = historicoDoPaciente(p.id)
  const e = p.endereco

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        {internacao && (
          <Alerta
            tom="info"
            titulo={`Internado no quarto ${buscarQuarto(internacao.quartoId)?.numero} há ${plural(diasInternado(internacao), 'dia')}`}
            acao={
              <BotaoLink to={`/internacoes/${internacao.id}`} tamanho="sm">
                Ver internação
              </BotaoLink>
            }
          >
            {internacao.motivo} · alta prevista {relativo(internacao.dataPrevistaAlta)} ({formatarData(internacao.dataPrevistaAlta)})
          </Alerta>
        )}

        <Cartao>
          <CabecalhoCartao titulo="Próximas consultas" icone={<CalendarDays />} />
          {proximas.length === 0 ? (
            <EstadoVazio
              className="py-10"
              icone={<CalendarDays />}
              titulo="Nenhuma consulta agendada"
              acao={
                <BotaoLink to={`/consultas/nova?pacienteId=${p.id}`} tamanho="sm" icone={<CalendarPlus />}>
                  Agendar consulta
                </BotaoLink>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {proximas.map((c) => {
                const prof = buscarProfissional(c.profissionalId)!
                return (
                  <li key={c.id}>
                    <Link to={`/consultas/${c.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-2/60">
                      <div className="flex w-12 shrink-0 flex-col items-center rounded-control border border-line bg-surface-2 py-1 leading-none">
                        <span className="text-2xs font-semibold text-ink-3 uppercase">{diaDaSemanaCurto(c.data)}</span>
                        <span className="mt-1 text-md font-semibold tabular">{c.data.slice(8)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{c.motivo}</p>
                        <p className="truncate text-sm text-ink-3">
                          {prof.nome} · {nomeEspecialidade(prof)}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <Horario c={c} />
                        <p className="text-xs text-ink-3">{relativo(c.data)}</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Cartao>

        <Cartao>
          <CabecalhoCartao
            titulo="Atendimentos recentes"
            icone={<FileClock />}
            acoes={
              <BotaoLink to="?aba=historico" variante="fantasma" tamanho="sm">
                Histórico completo
              </BotaoLink>
            }
          />
          <ul className="divide-y divide-line">
            {historico.filter((h) => h.data.slice(0, 10) <= hoje()).slice(0, 4).map((h) => (
              <li key={`${h.tipo}-${h.tipo === 'consulta' ? h.consulta.id : h.internacao.id}`} className="px-5 py-3">
                <LinhaEvento evento={h} />
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <div className="flex flex-col gap-6">
        <Cartao>
          <CabecalhoCartao titulo="Resumo" />
          <CorpoCartao className="grid grid-cols-3 gap-3 text-center">
            {[
              [realizadas.length, 'consultas realizadas'],
              [historico.filter((h) => h.tipo === 'internacao').length, 'internações'],
              [proximas.length, 'agendadas'],
            ].map(([n, r]) => (
              <div key={r} className="rounded-control bg-surface-2 px-2 py-3">
                <p className="text-xl font-semibold tabular">{n}</p>
                <p className="text-xs text-ink-3">{r}</p>
              </div>
            ))}
          </CorpoCartao>
        </Cartao>
        <Cartao>
          <CabecalhoCartao titulo="Dados pessoais" />
          <CorpoCartao>
            <ListaDefinicao
              colunas={1}
              itens={[
                { rotulo: 'CPF', valor: formatarCpf(p.cpf), mono: true },
                { rotulo: 'Data de nascimento', valor: `${formatarDataLonga(p.dataNascimento)} · ${idade(p.dataNascimento)} anos` },
                { rotulo: 'Telefone', valor: formatarTelefone(p.telefone) },
                { rotulo: 'E-mail', valor: p.email },
              ]}
            />
          </CorpoCartao>
        </Cartao>
        <Cartao>
          <CabecalhoCartao titulo="Endereço" />
          <CorpoCartao className="text-base leading-relaxed">
            <p>
              {e.logradouro}, {e.numero}
              {e.complemento && ` · ${e.complemento}`}
            </p>
            <p className="text-ink-2">
              {e.bairro} · {e.cidade}/{e.uf}
            </p>
            <p className="font-mono text-sm text-ink-3 tabular">CEP {formatarCep(e.cep)}</p>
          </CorpoCartao>
        </Cartao>
      </div>
    </div>
  )
}

/** Uma linha compacta de evento do histórico (usada na visão geral). */
function LinhaEvento({ evento }: { evento: EventoHistorico }) {
  if (evento.tipo === 'consulta') {
    const c = evento.consulta
    const prof = buscarProfissional(c.profissionalId)!
    return (
      <Link to={`/consultas/${c.id}`} className="flex items-center gap-3 hover:[&_p:first-child]:underline">
        <IconeEvento tipo="consulta" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium underline-offset-4">{c.motivo}</p>
          <p className="truncate text-sm text-ink-3">
            {formatarData(c.data)} · {prof.nome}
          </p>
        </div>
        <SeloConsulta status={c.status} />
      </Link>
    )
  }
  const i = evento.internacao
  return (
    <Link to={`/internacoes/${i.id}`} className="flex items-center gap-3 hover:[&_p:first-child]:underline">
      <IconeEvento tipo="internacao" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium underline-offset-4">{i.motivo}</p>
        <p className="truncate text-sm text-ink-3">
          {formatarData(i.dataEntrada)} · {plural(diasInternado(i), 'dia')} · quarto {buscarQuarto(i.quartoId)?.numero}
        </p>
      </div>
      <SeloInternacao status={i.status} />
    </Link>
  )
}

function IconeEvento({ tipo }: { tipo: EventoHistorico['tipo'] }) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4',
        tipo === 'consulta' ? 'bg-info-soft text-info' : 'bg-brand-soft text-brand-ink',
      )}
      aria-hidden
    >
      {tipo === 'consulta' ? <Stethoscope /> : <BedDouble />}
    </span>
  )
}

/* ───────────────────────── Histórico médico (RF6 · RN6) ───────────────────────── */

type FiltroHistorico = 'tudo' | 'consulta' | 'internacao'

function Historico({ eventos }: { eventos: EventoHistorico[] }) {
  const [filtro, setFiltro] = useState<FiltroHistorico>('tudo')
  const visiveis = eventos.filter((e) => filtro === 'tudo' || e.tipo === filtro)
  const porAno = visiveis.reduce<Record<string, EventoHistorico[]>>((acc, e) => {
    const ano = e.data.slice(0, 4)
    ;(acc[ano] ??= []).push(e)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <Pilulas<FiltroHistorico>
          rotulo="Filtrar histórico"
          className="mb-5"
          valor={filtro}
          aoMudar={setFiltro}
          opcoes={[
            { valor: 'tudo', rotulo: 'Tudo', contagem: eventos.length },
            { valor: 'consulta', rotulo: 'Consultas', contagem: eventos.filter((e) => e.tipo === 'consulta').length },
            { valor: 'internacao', rotulo: 'Internações', contagem: eventos.filter((e) => e.tipo === 'internacao').length },
          ]}
        />
        {visiveis.length === 0 ? (
          <Cartao>
            <EstadoVazio icone={<FileClock />} titulo="Sem atendimentos registrados" descricao="Consultas e internações aparecem aqui assim que acontecem." />
          </Cartao>
        ) : (
          Object.entries(porAno)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([ano, lista]) => (
              <section key={ano} className="mb-8">
                <h2 className="mb-3 font-mono text-sm font-medium text-ink-3 tabular">{ano}</h2>
                <ol className="relative flex flex-col gap-3 before:absolute before:top-4 before:bottom-4 before:left-[15px] before:w-px before:bg-line">
                  {lista.map((e) => (
                    <ItemHistorico key={`${e.tipo}-${e.tipo === 'consulta' ? e.consulta.id : e.internacao.id}`} evento={e} />
                  ))}
                </ol>
              </section>
            ))
        )}
      </div>
      <aside>
        <Alerta tom="info" titulo="O histórico é derivado">
          Montado a partir das consultas, internações e registros clínicos já gravados. Nada é apagado: atendimentos cancelados continuam aqui com o status
          correspondente (RN6).
        </Alerta>
      </aside>
    </div>
  )
}

function ItemHistorico({ evento }: { evento: EventoHistorico }) {
  const [aberto, setAberto] = useState(false)
  const registros = evento.registros
  const futuro = evento.data.slice(0, 10) > hoje()

  const cabecalho =
    evento.tipo === 'consulta'
      ? (() => {
          const c = evento.consulta
          const prof = buscarProfissional(c.profissionalId)!
          return {
            para: `/consultas/${c.id}`,
            tipo: 'Consulta',
            titulo: c.motivo,
            meta: `${formatarData(c.data)} · ${c.horario} · ${prof.nome} (${nomeEspecialidade(prof)})`,
            selo: <SeloConsulta status={c.status} />,
            nota: c.observacoesMedicas,
          }
        })()
      : (() => {
          const i = evento.internacao
          const prof = buscarProfissional(i.profissionalId)!
          const fim = i.dataEfetivaAlta ? formatarData(i.dataEfetivaAlta) : 'em curso'
          return {
            para: `/internacoes/${i.id}`,
            tipo: 'Internação',
            titulo: i.motivo,
            meta: `${formatarData(i.dataEntrada)} → ${fim} · quarto ${buscarQuarto(i.quartoId)?.numero} · ${prof.nome}`,
            selo: <SeloInternacao status={i.status} />,
            nota: i.observacoes,
          }
        })()

  return (
    <li className="relative flex gap-4">
      <span className="relative z-10 mt-3">
        <IconeEvento tipo={evento.tipo} />
      </span>
      <Cartao className={cn('min-w-0 flex-1', futuro && 'border-dashed')}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div className="min-w-0">
            <p className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
              {cabecalho.tipo}
              {futuro && ' · agendada'}
            </p>
            <Link to={cabecalho.para} className="mt-0.5 block font-semibold hover:underline hover:underline-offset-4">
              {cabecalho.titulo}
            </Link>
            <p className="mt-0.5 text-sm text-ink-3">{cabecalho.meta}</p>
          </div>
          {cabecalho.selo}
        </div>
        {cabecalho.nota && <p className="border-t border-line px-4 py-2.5 text-sm text-ink-2">{cabecalho.nota}</p>}
        {registros.length > 0 && (
          <div className="border-t border-line">
            <button
              onClick={() => setAberto(!aberto)}
              aria-expanded={aberto}
              className="flex w-full items-center gap-1.5 px-4 py-2 text-sm font-medium text-ink-2 hover:text-ink"
            >
              <ChevronDown className={cn('size-4 transition-transform', aberto && 'rotate-180')} />
              {plural(registros.length, 'registro clínico', 'registros clínicos')}
            </button>
            {aberto && (
              <div className="px-4 pt-1 pb-4">
                <RegistrosClinicos registros={registros} />
              </div>
            )}
          </div>
        )}
      </Cartao>
    </li>
  )
}
