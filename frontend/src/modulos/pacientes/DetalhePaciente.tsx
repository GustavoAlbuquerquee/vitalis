import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { BedDouble, CalendarDays, CalendarPlus, ChevronDown, FileClock, Pencil, Stethoscope } from 'lucide-react'
import {
  Abas,
  Alerta,
  BotaoLink,
  CabecalhoCartao,
  CabecalhoPagina,
  Cartao,
  CorpoCartao,
  EstadoVazio,
  ListaDefinicao,
  Pagina,
  Pilulas,
} from '@/ds'
import { Horario, RegistrosClinicos, SeloConsulta, SeloInternacao, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import { Pulseira } from '@/componentes/Pulseira'
import { CpfProtegido } from '@/componentes/CpfProtegido'
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
  formatarData,
  formatarDataLonga,
  formatarTelefone,
  plural,
  relativo,
} from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './DetalhePaciente.module.css'

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
        antes={<Pulseira paciente={paciente} quarto={internacao && buscarQuarto(internacao.quartoId)?.numero} />}
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
        className={s.abas}
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
    <div className={s.visaoGeral}>
      <div className={s.coluna}>
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
              className={s.vazioCompacto}
              icone={<CalendarDays />}
              titulo="Nenhuma consulta agendada"
              acao={
                <BotaoLink to={`/consultas/nova?pacienteId=${p.id}`} tamanho="sm" icone={<CalendarPlus />}>
                  Agendar consulta
                </BotaoLink>
              }
            />
          ) : (
            <ul className={s.lista}>
              {proximas.map((c) => {
                const prof = buscarProfissional(c.profissionalId)!
                return (
                  <li key={c.id}>
                    <Link to={`/consultas/${c.id}`} className={s.consulta}>
                      <div className={s.dia}>
                        <span className={s.diaSemana}>{diaDaSemanaCurto(c.data)}</span>
                        <span className={s.diaNumero}>{c.data.slice(8)}</span>
                      </div>
                      <div className={s.texto}>
                        <p className={s.consultaMotivo}>{c.motivo}</p>
                        <p className={s.linhaSecundaria}>
                          {prof.nome} · {nomeEspecialidade(prof)}
                        </p>
                      </div>
                      <div className={s.quando}>
                        <Horario c={c} />
                        <p className={s.quandoRelativo}>{relativo(c.data)}</p>
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
          <ul className={s.lista}>
            {historico.filter((h) => h.data.slice(0, 10) <= hoje()).slice(0, 4).map((h) => (
              <li key={`${h.tipo}-${h.tipo === 'consulta' ? h.consulta.id : h.internacao.id}`} className={s.itemRecente}>
                <LinhaEvento evento={h} />
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <div className={s.coluna}>
        <Cartao>
          <CabecalhoCartao titulo="Resumo" />
          <CorpoCartao className={s.resumo}>
            {[
              [realizadas.length, 'consultas realizadas'],
              [historico.filter((h) => h.tipo === 'internacao').length, 'internações'],
              [proximas.length, 'agendadas'],
            ].map(([n, r]) => (
              <div key={r} className={s.resumoItem}>
                <p className={s.resumoNumero}>{n}</p>
                <p className={s.resumoRotulo}>{r}</p>
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
                { rotulo: 'CPF', valor: <CpfProtegido cpf={p.cpf} /> },
                { rotulo: 'Data de nascimento', valor: `${formatarDataLonga(p.dataNascimento)} · ${idade(p.dataNascimento)} anos` },
                { rotulo: 'Telefone', valor: formatarTelefone(p.telefone) },
                { rotulo: 'E-mail', valor: p.email },
              ]}
            />
          </CorpoCartao>
        </Cartao>
        <Cartao>
          <CabecalhoCartao titulo="Endereço" />
          <CorpoCartao className={s.endereco}>
            <p>
              {e.logradouro}, {e.numero}
              {e.complemento && ` · ${e.complemento}`}
            </p>
            <p className={s.enderecoBairro}>
              {e.bairro} · {e.cidade}/{e.uf}
            </p>
            <p className={s.cep}>CEP {formatarCep(e.cep)}</p>
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
      <Link to={`/consultas/${c.id}`} className={s.evento}>
        <IconeEvento tipo="consulta" />
        <div className={s.texto}>
          <p className={s.eventoTitulo}>{c.motivo}</p>
          <p className={s.linhaSecundaria}>
            {formatarData(c.data)} · {prof.nome}
          </p>
        </div>
        <SeloConsulta status={c.status} />
      </Link>
    )
  }
  const i = evento.internacao
  return (
    <Link to={`/internacoes/${i.id}`} className={s.evento}>
      <IconeEvento tipo="internacao" />
      <div className={s.texto}>
        <p className={s.eventoTitulo}>{i.motivo}</p>
        <p className={s.linhaSecundaria}>
          {formatarData(i.dataEntrada)} · {plural(diasInternado(i), 'dia')} · quarto {buscarQuarto(i.quartoId)?.numero}
        </p>
      </div>
      <SeloInternacao status={i.status} />
    </Link>
  )
}

function IconeEvento({ tipo }: { tipo: EventoHistorico['tipo'] }) {
  return (
    <span data-tom={tipo === 'consulta' ? 'info' : 'brand'} className={s.iconeEvento} aria-hidden>
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
    <div className={s.historico}>
      <div>
        <Pilulas<FiltroHistorico>
          rotulo="Filtrar histórico"
          className={s.filtros}
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
              <section key={ano} className={s.ano}>
                <h2 className={s.anoTitulo}>{ano}</h2>
                <ol className={s.linhaTempo}>
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
    <li className={s.itemHistorico}>
      <span className={s.marcador}>
        <IconeEvento tipo={evento.tipo} />
      </span>
      <Cartao className={cn(s.cartaoEvento, futuro && s.futuro)}>
        <div className={s.eventoCabecalho}>
          <div className={s.eventoInfo}>
            <p className={s.eventoTipo}>
              {cabecalho.tipo}
              {futuro && ' · agendada'}
            </p>
            <Link to={cabecalho.para} className={s.eventoLink}>
              {cabecalho.titulo}
            </Link>
            <p className={s.eventoMeta}>{cabecalho.meta}</p>
          </div>
          {cabecalho.selo}
        </div>
        {cabecalho.nota && <p className={s.nota}>{cabecalho.nota}</p>}
        {registros.length > 0 && (
          <div className={s.registros}>
            <button
              onClick={() => setAberto(!aberto)}
              aria-expanded={aberto}
              className={s.alternar}
            >
              <ChevronDown className={cn(s.seta, aberto && s.setaAberta)} />
              {plural(registros.length, 'registro clínico', 'registros clínicos')}
            </button>
            {aberto && (
              <div className={s.registrosCorpo}>
                <RegistrosClinicos registros={registros} />
              </div>
            )}
          </div>
        )}
      </Cartao>
    </li>
  )
}
