import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { CalendarClock, CalendarX, ClipboardCheck, UserX } from 'lucide-react'
import {
  Alerta,
  AreaTexto,
  Botao,
  BotaoLink,
  CabecalhoCartao,
  CabecalhoPagina,
  Campo,
  Cartao,
  CorpoCartao,
  Entrada,
  ListaDefinicao,
  Modal,
  Pagina,
  usePrototipo,
  BotaoSegurar,
} from '@/ds'
import { Horario, Pessoa, RegistrosClinicos, SeloConsulta, nomeEspecialidade } from '@/componentes/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import { buscarConsulta, buscarPaciente, buscarProfissional, consultasDoProfissional, listarConsultas, listarRegistros } from '@/api'
import { cabeNaDisponibilidade, conflitaCom, consultaOcupaAgenda, intervaloDaConsulta } from '@/dominio/regras'
import { hoje, idade } from '@/lib/datas'
import { diaDaSemana, formatarData, formatarDataLonga, formatarTelefone, relativo } from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './DetalheConsulta.module.css'
import { CpfProtegido } from '@/componentes/CpfProtegido'

type Acao = 'realizar' | 'reagendar' | 'cancelar' | 'faltou' | null

export function DetalheConsulta() {
  const { id } = useParams()
  const prototipo = usePrototipo()
  const [acao, setAcao] = useState<Acao>(null)
  const [observacoes, setObservacoes] = useState('')
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const c = buscarConsulta(Number(id))
  const [novaData, setNovaData] = useState(c?.data ?? hoje())
  const [novoHorario, setNovoHorario] = useState(c?.horario ?? '')

  if (!c) return <NaoEncontrada titulo="Consulta não encontrada" voltarPara="/consultas" voltarRotulo="Voltar à agenda" />

  const paciente = buscarPaciente(c.pacienteId)!
  const prof = buscarProfissional(c.profissionalId)!
  const registros = listarRegistros({ tipo: 'consulta', id: c.id })
  const anteriores = listarConsultas({ pacienteId: paciente.id })
    .filter((x) => x.id !== c.id && x.data <= hoje())
    .reverse()
    .slice(0, 4)
  const aberta = c.status === 'AGENDADA'

  // Reagendamento: as mesmas regras do agendamento (RN3 + RF7), ignorando a própria consulta
  const novoIntervalo = novoHorario ? intervaloDaConsulta({ data: novaData, horario: novoHorario, duracaoMinutos: c.duracaoMinutos }) : undefined
  const conflito =
    novoIntervalo &&
    consultasDoProfissional(prof.id).find((x) => x.id !== c.id && consultaOcupaAgenda(x) && conflitaCom(novoIntervalo, intervaloDaConsulta(x)))
  const foraDaJanela = novoHorario && !cabeNaDisponibilidade(prof, novaData, novoHorario, c.duracaoMinutos)
  const passado = novaData < hoje()

  const fechar = () => setAcao(null)
  const concluir = (titulo: string) => {
    fechar()
    prototipo(titulo)
  }

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Agenda', para: `/consultas${c.data !== hoje() ? `?data=${c.data}` : ''}` }, { rotulo: `Consulta nº ${c.id}` }]}
        titulo={c.motivo}
        descricao={
          <span className={s.descricao}>
            <SeloConsulta status={c.status} />
            <span className="inicial-maiuscula">{diaDaSemana(c.data)}</span>, {formatarDataLonga(c.data)} · <Horario c={c} />
          </span>
        }
        acoes={
          aberta && (
            <>
              <Botao variante="fantasma" icone={<CalendarX />} onClick={() => setAcao('cancelar')}>
                Cancelar
              </Botao>
              <Botao icone={<CalendarClock />} onClick={() => setAcao('reagendar')}>
                Reagendar
              </Botao>
              <Botao variante="primario" icone={<ClipboardCheck />} onClick={() => setAcao('realizar')}>
                Registrar atendimento
              </Botao>
            </>
          )
        }
      />

      <div className={s.colunas}>
        <div className={s.pilha}>
          {c.status === 'CANCELADA' && (
            <Alerta tom="danger" titulo="Consulta cancelada">
              O registro foi mantido para o histórico do paciente (RN6). Para atendê-lo, agende uma nova consulta.
            </Alerta>
          )}
          {aberta && c.data === hoje() && (
            <Alerta tom="info" titulo={`Consulta de hoje, às ${c.horario}`}>
              Ao final do atendimento, registre as observações médicas para fechar a consulta.
            </Alerta>
          )}

          <Cartao>
            <CabecalhoCartao titulo="Atendimento" />
            <CorpoCartao>
              <ListaDefinicao
                colunas={3}
                itens={[
                  { rotulo: 'Data', valor: `${formatarData(c.data)} (${relativo(c.data)})` },
                  { rotulo: 'Horário', valor: <Horario c={c} /> },
                  { rotulo: 'Duração', valor: `${c.duracaoMinutos} minutos` },
                ]}
              />
              <div className={s.observacoes}>
                <p className={s.observacoesRotulo}>Observações médicas</p>
                {c.observacoesMedicas ? (
                  <p className={s.observacoesTexto}>{c.observacoesMedicas}</p>
                ) : (
                  <p className={s.observacoesVazio}>{aberta ? 'Preenchidas na realização da consulta.' : 'Sem observações.'}</p>
                )}
              </div>
            </CorpoCartao>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Registros clínicos" descricao="Diagnósticos, prescrições e exames feitos nesta consulta" />
            <CorpoCartao>
              <RegistrosClinicos registros={registros} />
            </CorpoCartao>
          </Cartao>
        </div>

        <div className={s.pilha}>
          <Cartao>
            <CabecalhoCartao titulo="Paciente" />
            <CorpoCartao className={s.corpoPaciente}>
              <Pessoa nome={paciente.nome} detalhe={`${idade(paciente.dataNascimento)} anos`} para={`/pacientes/${paciente.id}`} tamanho="lg" />
              <ListaDefinicao
                colunas={1}
                itens={[
                  { rotulo: 'CPF', valor: <CpfProtegido cpf={paciente.cpf} /> },
                  { rotulo: 'Telefone', valor: formatarTelefone(paciente.telefone) },
                ]}
              />
              <BotaoLink to={`/pacientes/${paciente.id}?aba=historico`} tamanho="sm" className={s.alinharInicio}>
                Ver histórico médico
              </BotaoLink>
            </CorpoCartao>
          </Cartao>
          <Cartao>
            <CabecalhoCartao titulo="Profissional responsável" />
            <CorpoCartao>
              <Pessoa nome={prof.nome} detalhe={`${nomeEspecialidade(prof)} · ${prof.registroProfissional}`} para={`/profissionais/${prof.id}`} tamanho="lg" />
            </CorpoCartao>
          </Cartao>
          {anteriores.length > 0 && (
            <Cartao>
              <CabecalhoCartao titulo="Consultas anteriores" />
              <ul className={s.anteriores}>
                {anteriores.map((x) => (
                  <li key={x.id}>
                    <Link to={`/consultas/${x.id}`} className={s.anterior}>
                      <div className={s.anteriorTexto}>
                        <p className={s.anteriorMotivo}>{x.motivo}</p>
                        <p className={cn(s.anteriorData, 'tabular')}>{formatarData(x.data)}</p>
                      </div>
                      <SeloConsulta status={x.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>
      </div>

      {/* Realizar */}
      <Modal
        aberto={acao === 'realizar'}
        aoFechar={fechar}
        titulo="Registrar atendimento"
        descricao={`${paciente.nome} · ${c.horario}`}
        largura="lg"
        rodape={
          <>
            <Botao variante="fantasma" icone={<UserX />} onClick={() => setAcao('faltou')} className={s.naoCompareceu}>
              Paciente não compareceu
            </Botao>
            <Botao variante="fantasma" onClick={fechar}>
              Voltar
            </Botao>
            <Botao variante="primario" disabled={!observacoes.trim()} onClick={() => concluir('Consulta realizada')}>
              Concluir consulta
            </Botao>
          </>
        }
      >
        <Campo rotulo="Observações médicas" obrigatorio ajuda="Ficam no histórico do paciente e não podem ser apagadas.">
          {(p) => <AreaTexto {...p} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={s.campoObservacoes} placeholder="Queixa, exame físico, conduta…" />}
        </Campo>
      </Modal>

      <Modal
        aberto={acao === 'faltou'}
        aoFechar={fechar}
        largura="sm"
        titulo="Registrar falta?"
        descricao={`A consulta fica com status "Não compareceu" e o horário de ${prof.nome.split(' ').slice(0, 2).join(' ')} é liberado.`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setAcao('realizar')}>
              Voltar
            </Botao>
            <Botao variante="primario" onClick={() => concluir('Falta registrada')}>
              Registrar falta
            </Botao>
          </>
        }
      />

      {/* Reagendar */}
      <Modal
        aberto={acao === 'reagendar'}
        aoFechar={fechar}
        titulo="Reagendar consulta"
        descricao={`Mesmo paciente e profissional. Hoje: ${formatarData(c.data)} às ${c.horario}.`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao variante="primario" disabled={!novoHorario || Boolean(conflito) || Boolean(foraDaJanela) || passado} onClick={() => concluir('Consulta reagendada')}>
              Confirmar novo horário
            </Botao>
          </>
        }
      >
        <div className={s.novoHorario}>
          <Campo rotulo="Nova data" obrigatorio>
            {(p) => <Entrada {...p} type="date" min={hoje()} value={novaData} onChange={(e) => setNovaData(e.target.value)} />}
          </Campo>
          <Campo rotulo="Novo horário" obrigatorio>
            {(p) => <Entrada {...p} type="time" step={300} value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />}
          </Campo>
        </div>
        <div className={s.alertas}>
          {passado && <Alerta tom="danger" titulo="Data no passado" />}
          {foraDaJanela && !passado && (
            <Alerta tom="warn" titulo="Fora da disponibilidade">
              {prof.nome} não atende neste horário (RF7).
            </Alerta>
          )}
          {conflito && (
            <Alerta tom="danger" titulo="Conflito de horário (RN3)">
              Já existe consulta das {conflito.horario} com {buscarPaciente(conflito.pacienteId)?.nome}.
            </Alerta>
          )}
          {novoHorario && !conflito && !foraDaJanela && !passado && <Alerta tom="ok" titulo="Horário livre" />}
        </div>
      </Modal>

      {/* Cancelar */}
      <Modal
        aberto={acao === 'cancelar'}
        aoFechar={fechar}
        largura="sm"
        titulo="Cancelar consulta?"
        descricao="A consulta não é apagada: muda para Cancelada e continua no histórico (RN6)."
        rodape={
          <>
            <Botao variante="fantasma" onClick={fechar}>
              Voltar
            </Botao>
            <BotaoSegurar disabled={!motivoCancelamento.trim()} feito="Consulta cancelada" aoConfirmar={() => concluir('Consulta cancelada')}>
              Segure para cancelar
            </BotaoSegurar>
          </>
        }
      >
        <Campo rotulo="Motivo do cancelamento" obrigatorio>
          {(p) => <AreaTexto {...p} value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)} placeholder="Ex.: paciente pediu remarcação" />}
        </Campo>
      </Modal>
    </Pagina>
  )
}
