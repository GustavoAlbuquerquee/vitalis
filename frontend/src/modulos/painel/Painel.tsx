import { ArrowRight, BedDouble, CalendarDays, CalendarPlus, DoorOpen, LogOut, Stethoscope } from 'lucide-react'
import { Link } from 'react-router'
import { BarraProgresso, BotaoLink, CabecalhoCartao, Cartao, EstadoVazio, Metrica, Pagina, CabecalhoPagina, PontosOcupacao } from '@/ds'
import { Horario, Pessoa, SeloConsulta, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, buscarQuarto, listarConsultas, listarInternacoes, listarProfissionais, listarQuartos } from '@/api'
import { hoje, minutos, somarDias, indiceDiaSemana } from '@/lib/datas'
import { diaDaSemana, formatarDataLonga, formatarDiaMes, plural, relativo } from '@/lib/formato'
import { diasSemana, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function Painel() {
  const dia = hoje()
  const agora = new Date().getHours() * 60 + new Date().getMinutes()
  const consultasHoje = listarConsultas({ data: dia }).filter((c) => c.status !== 'CANCELADA')
  const restantes = consultasHoje.filter((c) => c.status === 'AGENDADA')
  const atendidas = consultasHoje.filter((c) => c.status === 'REALIZADA').length

  // Agenda do dia encerrada? Mostra o próximo dia que tem consultas, em vez de um cartão vazio
  const diaDaLista = restantes.length
    ? dia
    : (Array.from({ length: 7 }, (_, i) => somarDias(dia, i + 1)).find((d) => listarConsultas({ data: d, status: 'AGENDADA' }).length) ?? dia)
  const proximas = diaDaLista === dia ? restantes : listarConsultas({ data: diaDaLista, status: 'AGENDADA' })

  const ativas = listarInternacoes({ status: 'ATIVA' })
  const altasHoje = ativas.filter((i) => i.dataPrevistaAlta <= dia)
  const altasProximas = ativas
    .filter((i) => i.dataPrevistaAlta <= somarDias(dia, 1))
    .sort((a, b) => a.dataPrevistaAlta.localeCompare(b.dataPrevistaAlta))

  const quartos = listarQuartos()
  const operacionais = quartos.filter((q) => !q.bloqueio)
  const capacidade = operacionais.reduce((s, q) => s + q.capacidadeMaxima, 0)
  const ocupadas = operacionais.reduce((s, q) => s + q.ocupacao, 0)
  const andares = [...new Set(quartos.map((q) => q.andar))].sort()

  const diaSemana = diasSemana[indiceDiaSemana(dia)].valor
  const profissionais = listarProfissionais()
  const atendendoAgora = profissionais.filter((p) =>
    p.disponibilidades.some((j) => j.diaSemana === diaSemana && minutos(j.horaInicio) <= agora && agora < minutos(j.horaFim)),
  )
  const escalados = profissionais.filter((p) => p.disponibilidades.some((j) => j.diaSemana === diaSemana))

  return (
    <Pagina>
      <CabecalhoPagina
        titulo={`${saudacao()}, Recepção`}
        descricao={
          <span className="block first-letter:uppercase">
            {diaDaSemana(dia)}, {formatarDataLonga(dia)} · {plural(restantes.length, 'consulta')} pela frente e {plural(altasHoje.length, 'alta prevista', 'altas previstas')} hoje.
          </span>
        }
        acoes={
          <>
            <BotaoLink to="/internacoes/nova" icone={<BedDouble />}>
              Nova internação
            </BotaoLink>
            <BotaoLink to="/consultas/nova" variante="primario" icone={<CalendarPlus />}>
              Agendar consulta
            </BotaoLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica
          rotulo="Consultas hoje"
          icone={<CalendarDays />}
          para="/consultas"
          valor={consultasHoje.length}
          detalhe={`${atendidas} realizadas · ${restantes.length} a seguir`}
        >
          <BarraProgresso valor={atendidas} total={consultasHoje.length} limiteAlerta={2} />
        </Metrica>
        <Metrica
          rotulo="Internações ativas"
          icone={<BedDouble />}
          para="/internacoes"
          valor={ativas.length}
          detalhe={altasHoje.length ? `${plural(altasHoje.length, 'alta prevista', 'altas previstas')} até hoje` : 'Nenhuma alta prevista para hoje'}
        />
        <Metrica
          rotulo="Ocupação"
          icone={<DoorOpen />}
          para="/quartos"
          valor={
            <>
              {Math.round((ocupadas / capacidade) * 100)}
              <span className="text-lg text-ink-3">%</span>
            </>
          }
          detalhe={`${ocupadas} de ${capacidade} vagas · ${plural(quartos.length - operacionais.length, 'quarto bloqueado', 'quartos bloqueados')}`}
        >
          <BarraProgresso valor={ocupadas} total={capacidade} />
        </Metrica>
        <Metrica
          rotulo="Atendendo agora"
          icone={<Stethoscope />}
          para="/profissionais"
          valor={
            <>
              {atendendoAgora.length}
              <span className="text-lg text-ink-3"> / {escalados.length}</span>
            </>
          }
          detalhe="profissionais escalados hoje"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Cartao>
          <CabecalhoCartao
            titulo="Próximas consultas"
            descricao={
              diaDaLista === dia ? 'Agendadas para hoje, em ordem de horário' : `A agenda de hoje terminou · ${diaDaSemana(diaDaLista)}, ${formatarDiaMes(diaDaLista)}`
            }
            acoes={
              <BotaoLink to={diaDaLista === dia ? '/consultas' : `/consultas?data=${diaDaLista}`} variante="fantasma" tamanho="sm" iconeDireita={<ArrowRight />}>
                Ver agenda
              </BotaoLink>
            }
          />
          {proximas.length === 0 ? (
            <EstadoVazio icone={<CalendarDays />} titulo="Nenhuma consulta pela frente" descricao="Não há consultas agendadas para os próximos dias." />
          ) : (
            <ul className="divide-y divide-line">
              {proximas.slice(0, 8).map((c, i) => {
                const paciente = buscarPaciente(c.pacienteId)!
                const prof = buscarProfissional(c.profissionalId)!
                const proxima = i === 0 && diaDaLista === dia
                return (
                  <li key={c.id}>
                    <Link to={`/consultas/${c.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-2/60">
                      <div className={cn('w-[104px] shrink-0', proxima && 'text-brand')}>
                        <Horario c={c} className={proxima ? '[&>span]:text-brand/70' : undefined} />
                        {proxima && <p className="text-2xs font-semibold tracking-wide uppercase">Próxima</p>}
                      </div>
                      <Pessoa nome={paciente.nome} detalhe={c.motivo} className="flex-1" />
                      <div className="hidden min-w-0 text-right md:block">
                        <p className="truncate text-sm text-ink-2">{prof.nome}</p>
                        <p className="truncate text-xs text-ink-3">{nomeEspecialidade(prof)}</p>
                      </div>
                      <SeloConsulta status={c.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          {proximas.length > 8 && (
            <div className="border-t border-line px-5 py-3 text-sm text-ink-3">
              + {plural(proximas.length - 8, 'consulta')} mais tarde.{' '}
              <Link to={diaDaLista === dia ? '/consultas' : `/consultas?data=${diaDaLista}`} className="font-medium text-brand hover:underline">
                Ver todas
              </Link>
            </div>
          )}
        </Cartao>

        <div className="flex flex-col gap-6">
          <Cartao>
            <CabecalhoCartao
              titulo="Ocupação por andar"
              acoes={
                <BotaoLink to="/quartos" variante="fantasma" tamanho="sm" iconeDireita={<ArrowRight />}>
                  Mapa
                </BotaoLink>
              }
            />
            <ul className="divide-y divide-line">
              {andares.map((andar) => {
                const qs = quartos.filter((q) => q.andar === andar)
                const ops = qs.filter((q) => !q.bloqueio)
                const cap = ops.reduce((s, q) => s + q.capacidadeMaxima, 0)
                const oc = ops.reduce((s, q) => s + q.ocupacao, 0)
                const tipos = [...new Set(qs.map((q) => tiposQuarto[q.tipo].rotulo))].join(' · ')
                return (
                  <li key={andar} className="px-5 py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">
                        {andar}º andar <span className="font-normal text-ink-3">· {tipos}</span>
                      </p>
                      <p className="text-sm text-ink-2 tabular">
                        {oc}/{cap}
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2">
                      {qs.map((q) => (
                        <Link key={q.id} to={`/quartos/${q.id}`} className="flex items-center gap-1.5 rounded px-1 -mx-1 hover:bg-surface-2" title={`Quarto ${q.numero}`}>
                          <span className="font-mono text-2xs text-ink-3">{q.numero}</span>
                          <PontosOcupacao ocupacao={q.ocupacao} capacidade={q.capacidadeMaxima} situacao={q.situacao} tamanho="sm" />
                        </Link>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Altas previstas" descricao="Até amanhã" icone={<LogOut />} />
            {altasProximas.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-3">Nenhuma alta prevista até amanhã.</p>
            ) : (
              <ul className="divide-y divide-line">
                {altasProximas.map((i) => {
                  const p = buscarPaciente(i.pacienteId)!
                  const q = buscarQuarto(i.quartoId)!
                  const atrasada = i.dataPrevistaAlta < dia
                  return (
                    <li key={i.id}>
                      <Link to={`/internacoes/${i.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60">
                        <Pessoa nome={p.nome} tamanho="sm" detalhe={`Quarto ${q.numero}`} className="flex-1" />
                        <span className={cn('text-sm font-medium', atrasada ? 'text-danger' : i.dataPrevistaAlta === dia ? 'text-warn' : 'text-ink-3')}>
                          {atrasada ? 'atrasada' : relativo(i.dataPrevistaAlta)}
                        </span>
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
