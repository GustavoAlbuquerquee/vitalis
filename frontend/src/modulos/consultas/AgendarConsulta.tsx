import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AreaTexto, Botao, CabecalhoCartao, CabecalhoPagina, Campo, Cartao, CorpoCartao, Entrada, Modal, Pagina, Secao, Selecao, usePrototipo } from '@/ds'
import StatusMark from '@/ds/react-bits/StatusMark'
import { Horario } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, consultasDoProfissional, listarPacientes, listarProfissionais } from '@/api'
import { cabeNaDisponibilidade, conflitaCom, consultaOcupaAgenda, intervaloDaConsulta } from '@/dominio/regras'
import { hhmm, hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diaDaSemana, formatarData } from '@/lib/formato'
import { diasSemana, especialidades } from '@/lib/rotulos'
import type { Especialidade } from '@/tipos/dominio'
import { cn } from '@/lib/cn'
import { Comprovante } from './Comprovante'
import s from './AgendarConsulta.module.css'

const DURACOES = [20, 30, 45, 60]

export function AgendarConsulta() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const prototipo = usePrototipo()

  const [pacienteId, setPacienteId] = useState(params.get('pacienteId') ?? '')
  const [profissionalId, setProfissionalId] = useState(params.get('profissionalId') ?? '')
  // Depois do expediente, o padrão já é amanhã
  const [data, setData] = useState(params.get('data') ?? (new Date().getHours() >= 19 ? somarDias(hoje(), 1) : hoje()))
  const [horario, setHorario] = useState(params.get('horario') ?? '')
  const [duracao, setDuracao] = useState(30)
  const [motivo, setMotivo] = useState('')
  const [tentou, setTentou] = useState(false)
  const [comprovante, setComprovante] = useState(false)

  const pacientes = listarPacientes().filter((p) => p.ativo)
  const profissionais = listarProfissionais()
  const profissional = profissionalId ? buscarProfissional(Number(profissionalId)) : undefined
  const paciente = pacienteId ? buscarPaciente(Number(pacienteId)) : undefined

  const ocupadas = useMemo(
    () => (profissional ? consultasDoProfissional(profissional.id).filter((c) => c.data === data && consultaOcupaAgenda(c)).sort((a, b) => a.horario.localeCompare(b.horario)) : []),
    [profissional, data],
  )

  // Horários sugeridos: cada 30 min dentro das janelas do dia
  const dia = diasSemana[indiceDiaSemana(data)].valor
  const janelas = profissional?.disponibilidades.filter((j) => j.diaSemana === dia) ?? []
  const sugestoes = janelas.flatMap((j) => {
    const lista: string[] = []
    for (let t = minutos(j.horaInicio); t + duracao <= minutos(j.horaFim); t += 30) lista.push(hhmm(t))
    return lista
  })
  const proximoDia = profissional
    ? Array.from({ length: 14 }, (_, i) => somarDias(data, i + 1)).find((d) =>
        profissional.disponibilidades.some((j) => j.diaSemana === diasSemana[indiceDiaSemana(d)].valor),
      )
    : undefined
  const novo = horario ? intervaloDaConsulta({ data, horario, duracaoMinutos: duracao }) : undefined
  const livre = (h: string) => {
    const iv = intervaloDaConsulta({ data, horario: h, duracaoMinutos: duracao })
    return !ocupadas.some((c) => conflitaCom(iv, intervaloDaConsulta(c)))
  }
  if (data === hoje()) {
    const agora = new Date().getHours() * 60 + new Date().getMinutes()
    for (let i = sugestoes.length - 1; i >= 0; i--) if (minutos(sugestoes[i]) <= agora) sugestoes.splice(i, 1)
  }

  // As regras, avaliadas ao vivo
  const conflito = novo && ocupadas.find((c) => conflitaCom(novo, intervaloDaConsulta(c)))
  const noPassado = data < hoje() || (data === hoje() && horario !== '' && minutos(horario) <= new Date().getHours() * 60 + new Date().getMinutes())
  const naJanela = profissional && horario ? cabeNaDisponibilidade(profissional, data, horario, duracao) : undefined

  const verificacoes: { ok: boolean | undefined; titulo: string; detalhe: ReactNode; regra: string }[] = [
    {
      ok: paciente && profissional ? true : undefined,
      titulo: 'Paciente e profissional definidos',
      detalhe: 'Toda consulta tem um paciente e um profissional responsável.',
      regra: 'RN2',
    },
    {
      ok: horario ? !noPassado : undefined,
      titulo: 'Data futura',
      detalhe: noPassado ? 'Não é possível agendar no passado.' : 'O agendamento não pode ser retroativo.',
      regra: 'RF3',
    },
    {
      ok: naJanela,
      titulo: 'Dentro da disponibilidade',
      detalhe:
        naJanela === false
          ? janelas.length
            ? `${profissional?.nome} atende ${janelas.map((j) => `${j.horaInicio}–${j.horaFim}`).join(' e ')} às ${diasSemana[indiceDiaSemana(data)].rotulo.toLowerCase()}s.`
            : `${profissional?.nome} não atende às ${diasSemana[indiceDiaSemana(data)].rotulo.toLowerCase()}s.`
          : 'O horário precisa caber numa janela de atendimento do profissional.',
      regra: 'RF7',
    },
    {
      ok: novo && profissional ? !conflito : undefined,
      titulo: 'Sem conflito de horário',
      detalhe: conflito ? (
        <>
          Conflita com a{' '}
          <Link to={`/consultas/${conflito.id}`} className={s.linkConflito}>
            consulta das {conflito.horario}
          </Link>{' '}
          de {buscarPaciente(conflito.pacienteId)?.nome}.
        </>
      ) : (
        'Um profissional não pode ter dois atendimentos no mesmo horário.'
      ),
      regra: 'RN3',
    },
  ]
  const bloqueado = verificacoes.some((v) => v.ok === false)
  const completo = verificacoes.every((v) => v.ok) && motivo.trim().length > 0

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    if (!completo) return
    setComprovante(true)
  }

  const concluir = () => {
    prototipo('Consulta agendada')
    navegar(`/consultas${data !== hoje() ? `?data=${data}` : ''}`)
  }


  const porEspecialidade = Object.entries(especialidades)
    .map(([k, v]) => ({ k: k as Especialidade, rotulo: v.rotulo, lista: profissionais.filter((p) => p.especialidade === k) }))
    .filter((g) => g.lista.length)

  return (
    <Pagina>
      <CabecalhoPagina migalhas={[{ rotulo: 'Agenda', para: '/consultas' }, { rotulo: 'Agendar consulta' }]} titulo="Agendar consulta" />

      <form onSubmit={enviar} noValidate className={s.formulario}>
        <Cartao className={s.cartaoForm}>
          <Secao titulo="Quem" descricao="O paciente e o profissional que vai atendê-lo.">
            <Campo rotulo="Paciente" obrigatorio erro={tentou && !paciente ? 'Escolha o paciente.' : undefined}>
              {(p) => (
                <Selecao {...p} value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {pacientes.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))}
                </Selecao>
              )}
            </Campo>
            <Campo rotulo="Profissional" obrigatorio erro={tentou && !profissional ? 'Escolha o profissional.' : undefined}>
              {(p) => (
                <Selecao {...p} value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {porEspecialidade.map((g) => (
                    <optgroup key={g.k} label={g.rotulo}>
                      {g.lista.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.nome}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Selecao>
              )}
            </Campo>
          </Secao>

          <Secao titulo="Quando" descricao="Os horários sugeridos respeitam a disponibilidade e a agenda já ocupada.">
            <Campo rotulo="Data" obrigatorio colunas={3} ajuda={<span className="inicial-maiuscula">{diaDaSemana(data)}</span>}>
              {(p) => <Entrada {...p} type="date" min={hoje()} value={data} onChange={(e) => setData(e.target.value)} />}
            </Campo>
            <Campo rotulo="Duração" obrigatorio colunas={3}>
              {(p) => (
                <Selecao {...p} value={duracao} onChange={(e) => setDuracao(Number(e.target.value))}>
                  {DURACOES.map((d) => (
                    <option key={d} value={d}>
                      {d} minutos
                    </option>
                  ))}
                </Selecao>
              )}
            </Campo>
            <div>
              <p className={s.rotuloHorario}>
                Horário<span className={s.obrigatorio}>*</span>
              </p>
              {!profissional ? (
                <p className={s.semHorarios}>Escolha o profissional para ver os horários livres.</p>
              ) : sugestoes.length === 0 ? (
                <div className={cn(s.semHorarios, s.semHorariosAcao)}>
                  {janelas.length ? 'Sem horários livres neste dia.' : `${profissional.nome} não atende neste dia da semana.`}
                  {proximoDia && (
                    <Botao tamanho="sm" onClick={() => (setData(proximoDia), setHorario(''))}>
                      Ir para {diaDaSemana(proximoDia)}, {formatarData(proximoDia)}
                    </Botao>
                  )}
                </div>
              ) : (
                <div role="radiogroup" aria-label="Horário" className={s.horarios}>
                  {sugestoes.map((h) => {
                    const ok = livre(h)
                    const ativo = h === horario
                    return (
                      <button
                        key={h}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        disabled={!ok}
                        onClick={() => setHorario(h)}
                        className={cn(s.slot, ativo ? s.slotAtivo : ok ? s.slotLivre : s.slotOcupado)}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              )}
              <div className={s.outroHorario}>
                <span className={s.semQuebra}>Outro horário:</span>
                <Entrada type="time" step={300} value={horario} onChange={(e) => setHorario(e.target.value)} aria-label="Horário manual" />
              </div>
            </div>
          </Secao>

          <Secao titulo="Por quê" descricao="O motivo aparece na agenda e no histórico do paciente.">
            <Campo rotulo="Motivo da consulta" obrigatorio erro={tentou && !motivo.trim() ? 'Descreva o motivo.' : undefined}>
              {(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: dor torácica há três dias" />}
            </Campo>
          </Secao>
        </Cartao>

        <div className={s.lateral}>
          <Cartao>
            <CabecalhoCartao titulo="Verificação" descricao="As regras de negócio, avaliadas enquanto você preenche" />
            <ul className={s.verificacoes}>
              {verificacoes.map((v) => (
                <li key={v.regra} className={s.verificacao}>
                  <span className={s.icone} role="img" aria-label={v.ok === undefined ? 'Pendente' : v.ok ? 'Atendida' : 'Violada'}>
                    <StatusMark
                      status={v.ok === undefined ? 'pending' : v.ok ? 'done' : 'failed'}
                      size={18}
                      color="var(--ink-3)"
                      doneColor="var(--ok)"
                      errorColor="var(--danger)"
                    />
                  </span>
                  <div className={s.verificacaoTexto}>
                    <p className={cn(s.verificacaoTitulo, v.ok === false && s.violada)}>
                      {v.titulo}
                      <span className={s.regra}>{v.regra}</span>
                    </p>
                    <p className={s.verificacaoDetalhe}>{v.detalhe}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className={s.rodapeVerificacao}>
              <Botao type="submit" variante="primario" className={s.botaoCheio} disabled={bloqueado}>
                Agendar consulta
              </Botao>
              {paciente && profissional && horario && !bloqueado && (
                <p className={s.resumo}>
                  {formatarData(data)} às {horario} · {duracao} min
                </p>
              )}
            </div>
          </Cartao>

          {profissional && (
            <Cartao>
              <CabecalhoCartao titulo={`Agenda de ${profissional.nome.split(' ').slice(0, 2).join(' ')}`} descricao={formatarData(data)} />
              <CorpoCartao className={s.corpoAgenda}>
                {ocupadas.length === 0 ? (
                  <p className={s.semAtendimento}>Nenhum atendimento neste dia.</p>
                ) : (
                  <ul className={s.ocupadas}>
                    {ocupadas.map((c) => (
                      <li key={c.id} className={cn(s.ocupada, conflito?.id === c.id && s.ocupadaConflito)}>
                        <Horario c={c} className={s.ocupadaHorario} />
                        <span className={s.ocupadaPaciente}>{buscarPaciente(c.pacienteId)?.nome}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CorpoCartao>
            </Cartao>
          )}
        </div>
      </form>
      {comprovante && paciente && profissional && (
        <Modal aberto aoFechar={() => setComprovante(false)} titulo="Consulta agendada" largura="lg" rodape={<Botao onClick={concluir}>Concluir sem destacar</Botao>}>
          <Comprovante paciente={paciente} profissional={profissional} data={data} horario={horario} duracao={duracao} aoDestacar={() => window.setTimeout(concluir, 700)} />
        </Modal>
      )}
    </Pagina>
  )
}
