import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { CircleCheck, CircleDashed, CircleX } from 'lucide-react'
import { AreaTexto, Botao, CabecalhoCartao, CabecalhoPagina, Campo, Cartao, CorpoCartao, Entrada, Pagina, Secao, Selecao, usePrototipo } from '@/ds'
import { Horario } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, consultasDoProfissional, listarPacientes, listarProfissionais } from '@/api'
import { cabeNaDisponibilidade, conflitaCom, consultaOcupaAgenda, intervaloDaConsulta } from '@/dominio/regras'
import { hhmm, hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diaDaSemana, formatarData } from '@/lib/formato'
import { diasSemana, especialidades } from '@/lib/rotulos'
import type { Especialidade } from '@/tipos/dominio'
import { cn } from '@/lib/cn'

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
          <Link to={`/consultas/${conflito.id}`} className="font-medium text-danger underline underline-offset-2">
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
    prototipo('Consulta agendada')
    navegar(`/consultas${data !== hoje() ? `?data=${data}` : ''}`)
  }

  const porEspecialidade = Object.entries(especialidades)
    .map(([k, v]) => ({ k: k as Especialidade, rotulo: v.rotulo, lista: profissionais.filter((p) => p.especialidade === k) }))
    .filter((g) => g.lista.length)

  return (
    <Pagina>
      <CabecalhoPagina migalhas={[{ rotulo: 'Agenda', para: '/consultas' }, { rotulo: 'Agendar consulta' }]} titulo="Agendar consulta" />

      <form onSubmit={enviar} noValidate className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Cartao className="px-5 py-7 sm:px-8">
          <Secao titulo="Quem" descricao="O paciente e o profissional que vai atendê-lo.">
            <Campo rotulo="Paciente" obrigatorio erro={tentou && !paciente ? 'Escolha o paciente.' : undefined} className="sm:col-span-6">
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
            <Campo rotulo="Profissional" obrigatorio erro={tentou && !profissional ? 'Escolha o profissional.' : undefined} className="sm:col-span-6">
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
            <Campo rotulo="Data" obrigatorio className="sm:col-span-3" ajuda={<span className="inline-block first-letter:uppercase">{diaDaSemana(data)}</span>}>
              {(p) => <Entrada {...p} type="date" min={hoje()} value={data} onChange={(e) => setData(e.target.value)} />}
            </Campo>
            <Campo rotulo="Duração" obrigatorio className="sm:col-span-3">
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
            <div className="sm:col-span-6">
              <p className="mb-1.5 text-sm font-medium">
                Horário<span className="ml-0.5 text-danger">*</span>
              </p>
              {!profissional ? (
                <p className="rounded-control border border-dashed border-line-strong px-3 py-4 text-center text-sm text-ink-3">Escolha o profissional para ver os horários livres.</p>
              ) : sugestoes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-control border border-dashed border-line-strong px-3 py-4 text-center text-sm text-ink-3">
                  {janelas.length ? 'Sem horários livres neste dia.' : `${profissional.nome} não atende neste dia da semana.`}
                  {proximoDia && (
                    <Botao tamanho="sm" onClick={() => (setData(proximoDia), setHorario(''))}>
                      Ir para {diaDaSemana(proximoDia)}, {formatarData(proximoDia)}
                    </Botao>
                  )}
                </div>
              ) : (
                <div role="radiogroup" aria-label="Horário" className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
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
                        className={cn(
                          'h-9 rounded-control border font-mono text-sm tabular transition-colors',
                          ativo
                            ? 'border-brand bg-brand text-on-brand'
                            : ok
                              ? 'border-line-strong bg-surface hover:border-brand hover:text-brand'
                              : 'cursor-not-allowed border-line bg-surface-2 text-ink-3 line-through',
                        )}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm text-ink-3">
                <span className="whitespace-nowrap">Outro horário:</span>
                <Entrada type="time" step={300} value={horario} onChange={(e) => setHorario(e.target.value)} className="w-32" aria-label="Horário manual" />
              </div>
            </div>
          </Secao>

          <Secao titulo="Por quê" descricao="O motivo aparece na agenda e no histórico do paciente.">
            <Campo rotulo="Motivo da consulta" obrigatorio erro={tentou && !motivo.trim() ? 'Descreva o motivo.' : undefined} className="sm:col-span-6">
              {(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: dor torácica há três dias" className="min-h-20" />}
            </Campo>
          </Secao>
        </Cartao>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <Cartao>
            <CabecalhoCartao titulo="Verificação" descricao="As regras de negócio, avaliadas enquanto você preenche" />
            <ul className="divide-y divide-line">
              {verificacoes.map((v) => (
                <li key={v.regra} className="flex gap-3 px-5 py-3">
                  {v.ok === undefined ? (
                    <CircleDashed className="mt-0.5 size-[18px] shrink-0 text-ink-3" aria-label="Pendente" />
                  ) : v.ok ? (
                    <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-ok" aria-label="Atendida" />
                  ) : (
                    <CircleX className="mt-0.5 size-[18px] shrink-0 text-danger" aria-label="Violada" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn('flex items-center justify-between gap-2 text-sm font-medium', v.ok === false && 'text-danger')}>
                      {v.titulo}
                      <span className="font-mono text-2xs font-normal text-ink-3">{v.regra}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">{v.detalhe}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <Botao type="submit" variante="primario" className="w-full" disabled={bloqueado}>
                Agendar consulta
              </Botao>
              {paciente && profissional && horario && !bloqueado && (
                <p className="mt-2 text-center text-xs text-ink-3">
                  {formatarData(data)} às {horario} · {duracao} min
                </p>
              )}
            </div>
          </Cartao>

          {profissional && (
            <Cartao>
              <CabecalhoCartao titulo={`Agenda de ${profissional.nome.split(' ').slice(0, 2).join(' ')}`} descricao={formatarData(data)} />
              <CorpoCartao className="py-3">
                {ocupadas.length === 0 ? (
                  <p className="text-sm text-ink-3">Nenhum atendimento neste dia.</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {ocupadas.map((c) => (
                      <li key={c.id} className={cn('flex items-center gap-3 rounded-[6px] px-2 py-1', conflito?.id === c.id && 'bg-danger-soft')}>
                        <Horario c={c} className="w-28 shrink-0" />
                        <span className="truncate text-sm text-ink-2">{buscarPaciente(c.pacienteId)?.nome}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CorpoCartao>
            </Cartao>
          )}
        </div>
      </form>
    </Pagina>
  )
}
