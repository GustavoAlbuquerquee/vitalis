import { ArrowRight, BedDouble, CalendarDays, CalendarPlus, DoorOpen, LogOut, Stethoscope } from 'lucide-react'
import { Link } from 'react-router'
import { BarraProgresso, BotaoLink, CabecalhoCartao, Cartao, EstadoVazio, Metrica, Pagina, CabecalhoPagina, PontosOcupacao } from '@/ds'
import { Horario, Pessoa, SeloConsulta, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, buscarQuarto, listarConsultas, listarInternacoes, listarProfissionais, listarQuartos } from '@/api'
import { hoje, minutos, somarDias, indiceDiaSemana } from '@/lib/datas'
import { diaDaSemana, formatarDataLonga, formatarDiaMes, plural, relativo } from '@/lib/formato'
import { diasSemana, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import CountUp from '@/ds/react-bits/CountUp'
import { PainelChamada } from './PainelChamada'
import { TracadoDoDia } from './TracadoDoDia'
import s from './Painel.module.css'

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
          <span className={s.descricao}>
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

      <div className={s.metricas}>
        <Metrica
          rotulo="Consultas hoje"
          icone={<CalendarDays />}
          para="/consultas"
          valor={<CountUp to={consultasHoje.length} duration={0.9} />}
          detalhe={`${atendidas} realizadas · ${restantes.length} a seguir`}
        >
          <BarraProgresso valor={atendidas} total={consultasHoje.length} limiteAlerta={2} />
        </Metrica>
        <Metrica
          rotulo="Internações ativas"
          icone={<BedDouble />}
          para="/internacoes"
          valor={<CountUp to={ativas.length} duration={0.9} />}
          detalhe={altasHoje.length ? `${plural(altasHoje.length, 'alta prevista', 'altas previstas')} até hoje` : 'Nenhuma alta prevista para hoje'}
        />
        <Metrica
          rotulo="Ocupação"
          icone={<DoorOpen />}
          para="/quartos"
          valor={<CountUp to={Math.round((ocupadas / capacidade) * 100)} duration={0.9} />}
          unidade="%"
          detalhe={`${ocupadas} de ${capacidade} vagas · ${plural(quartos.length - operacionais.length, 'quarto bloqueado', 'quartos bloqueados')}`}
        >
          <BarraProgresso valor={ocupadas} total={capacidade} />
        </Metrica>
        <Metrica
          rotulo="Atendendo agora"
          icone={<Stethoscope />}
          para="/profissionais"
          valor={<CountUp to={atendendoAgora.length} duration={0.9} />}
          unidade={` / ${escalados.length}`}
          detalhe="profissionais escalados hoje"
        />
      </div>

      <div className={s.colunas}>
        <div className={s.principal}>
        <TracadoDoDia consultas={consultasHoje} />
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
            <ul className={s.lista}>
              {proximas.slice(0, 8).map((c, i) => {
                const paciente = buscarPaciente(c.pacienteId)!
                const prof = buscarProfissional(c.profissionalId)!
                const proxima = i === 0 && diaDaLista === dia
                return (
                  <li key={c.id}>
                    <Link to={`/consultas/${c.id}`} className={s.linhaConsulta}>
                      <div className={cn(s.quando, proxima && s.quandoProxima)}>
                        <Horario c={c} className={proxima ? s.horarioProxima : undefined} />
                        {proxima && <p className={s.rotuloProxima}>Próxima</p>}
                      </div>
                      <Pessoa nome={paciente.nome} detalhe={c.motivo} className={s.pessoa} />
                      <div className={s.profissional}>
                        <p className={s.profissionalNome}>{prof.nome}</p>
                        <p className={s.profissionalEspecialidade}>{nomeEspecialidade(prof)}</p>
                      </div>
                      <SeloConsulta status={c.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          {proximas.length > 8 && (
            <div className={s.mais}>
              + {plural(proximas.length - 8, 'consulta')} mais tarde.{' '}
              <Link to={diaDaLista === dia ? '/consultas' : `/consultas?data=${diaDaLista}`} className={s.verTodas}>
                Ver todas
              </Link>
            </div>
          )}
        </Cartao>
        </div>

        <div className={s.lateral}>
          <PainelChamada consultas={proximas} rotulo={diaDaLista === dia ? 'Ao vivo' : `${diaDaSemana(diaDaLista).split('-')[0]} ${formatarDiaMes(diaDaLista)}`} />
          <Cartao>
            <CabecalhoCartao
              titulo="Ocupação por andar"
              acoes={
                <BotaoLink to="/quartos" variante="fantasma" tamanho="sm" iconeDireita={<ArrowRight />}>
                  Mapa
                </BotaoLink>
              }
            />
            <ul className={s.lista}>
              {andares.map((andar) => {
                const qs = quartos.filter((q) => q.andar === andar)
                const ops = qs.filter((q) => !q.bloqueio)
                const cap = ops.reduce((s, q) => s + q.capacidadeMaxima, 0)
                const oc = ops.reduce((s, q) => s + q.ocupacao, 0)
                const tipos = [...new Set(qs.map((q) => tiposQuarto[q.tipo].rotulo))].join(' · ')
                return (
                  <li key={andar} className={s.andar}>
                    <div className={s.andarTopo}>
                      <p className={s.andarNome}>
                        {andar}º andar <span className={s.andarTipos}>· {tipos}</span>
                      </p>
                      <p className={cn(s.andarContagem, 'tabular')}>
                        {oc}/{cap}
                      </p>
                    </div>
                    <div className={s.quartos}>
                      {qs.map((q) => (
                        <Link key={q.id} to={`/quartos/${q.id}`} className={s.quarto} title={`Quarto ${q.numero}`}>
                          <span className={s.quartoNumero}>{q.numero}</span>
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
              <p className={s.semAltas}>Nenhuma alta prevista até amanhã.</p>
            ) : (
              <ul className={s.lista}>
                {altasProximas.map((i) => {
                  const p = buscarPaciente(i.pacienteId)!
                  const q = buscarQuarto(i.quartoId)!
                  const atrasada = i.dataPrevistaAlta < dia
                  return (
                    <li key={i.id}>
                      <Link to={`/internacoes/${i.id}`} className={s.linhaAlta}>
                        <Pessoa nome={p.nome} tamanho="sm" detalhe={`Quarto ${q.numero}`} className={s.pessoa} />
                        <span className={cn(s.prazo, atrasada ? s.prazoAtrasada : i.dataPrevistaAlta === dia ? s.prazoHoje : s.prazoFuturo)}>
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
