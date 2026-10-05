import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, BedDouble } from 'lucide-react'
import {
  Alerta,
  AreaTexto,
  Botao,
  BotaoLink,
  CabecalhoPagina,
  Campo,
  Cartao,
  Entrada,
  Pagina,
  PontosOcupacao,
  Secao,
  Selecao,
  Selo,
  usePrototipo,
} from '@/ds'
import { nomeEspecialidade } from '@/componentes/dominio'
import { internacaoAtivaDoPaciente, listarPacientes, listarProfissionais, listarQuartos, type QuartoComOcupacao } from '@/api'
import { formatarCpf, formatarData, formatarDataHora, plural } from '@/lib/formato'
import { situacaoQuarto, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { agora } from './utilidades'
import s from './NovaInternacao.module.css'

type CampoForm = 'paciente' | 'profissional' | 'quarto' | 'entrada' | 'alta' | 'motivo'

const podeReceber = (q: QuartoComOcupacao) => q.situacao === 'DISPONIVEL' && q.vagas > 0

export function NovaInternacao() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const prototipo = usePrototipo()

  const pacientes = listarPacientes().filter((p) => p.ativo)
  const profissionais = listarProfissionais().filter((p) => p.ativo)
  const quartos = listarQuartos()

  const pacienteInicial = pacientes.some((p) => p.id === Number(params.get('pacienteId'))) ? String(params.get('pacienteId')) : ''
  const quartoInicial = quartos.find((q) => q.id === Number(params.get('quartoId')) && podeReceber(q))?.id ?? null

  const [pacienteId, setPacienteId] = useState(pacienteInicial)
  const [profissionalId, setProfissionalId] = useState('')
  const [quartoId, setQuartoId] = useState<number | null>(quartoInicial)
  const [entrada, setEntrada] = useState(agora)
  const [alta, setAlta] = useState('')
  const [motivo, setMotivo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [tentou, setTentou] = useState(false)

  const jaInternado = pacienteId ? internacaoAtivaDoPaciente(Number(pacienteId)) : undefined
  const quarto = quartos.find((q) => q.id === quartoId)
  const dataEntrada = entrada.split('T')[0]
  const altaAntes = Boolean(alta && dataEntrada) && alta < dataEntrada

  const erros: Partial<Record<CampoForm, string>> = {}
  if (!pacienteId) erros.paciente = 'Escolha o paciente.'
  else if (jaInternado) erros.paciente = 'Este paciente já tem uma internação ativa.'
  if (!profissionalId) erros.profissional = 'Escolha o profissional responsável.'
  if (!quarto) erros.quarto = 'Escolha um quarto com vaga.'
  else if (!podeReceber(quarto)) erros.quarto = 'Este quarto não pode receber pacientes.'
  if (!entrada) erros.entrada = 'Informe a data e a hora de entrada.'
  if (!alta) erros.alta = 'Informe a alta prevista.'
  else if (altaAntes) erros.alta = 'A alta prevista não pode ser anterior à entrada.'
  if (!motivo.trim()) erros.motivo = 'Descreva o motivo da internação.'

  /** Violações de regra de negócio: bloqueiam o envio mesmo antes da primeira tentativa. */
  const bloqueado = Boolean(jaInternado) || altaAntes
  const erro = (c: CampoForm) => (tentou || (c === 'alta' && altaAntes) ? erros[c] : undefined)

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    if (Object.keys(erros).length) return
    prototipo('Internação registrada')
    navegar('/internacoes')
  }

  return (
    <Pagina estreita>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Internações', para: '/internacoes' }, { rotulo: 'Nova internação' }]}
        titulo="Nova internação"
        descricao="Paciente, responsável e um quarto com vaga — a internação, a ocupação e a situação do quarto são gravadas juntas."
      />

      <form onSubmit={enviar} noValidate>
        <Cartao className={s.cartao}>
          <Secao titulo="Paciente" descricao="Somente pacientes ativos. Um paciente não pode ter duas internações ativas (RN4).">
            <Campo rotulo="Paciente" obrigatorio erro={jaInternado ? undefined : erro('paciente')}>
              {(p) => (
                <Selecao {...p} aria-invalid={p['aria-invalid'] || Boolean(jaInternado)} value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required>
                  <option value="">Selecione o paciente…</option>
                  {pacientes.map((pac) => (
                    <option key={pac.id} value={pac.id}>
                      {pac.nome} · {formatarCpf(pac.cpf)}
                      {internacaoAtivaDoPaciente(pac.id) ? ' (internado)' : ''}
                    </option>
                  ))}
                </Selecao>
              )}
            </Campo>
            {jaInternado && (
              <Alerta
                tom="danger"
                titulo="Paciente já internado"
                acao={
                  <BotaoLink to={`/internacoes/${jaInternado.id}`} tamanho="sm" iconeDireita={<ArrowRight />}>
                    Ver internação
                  </BotaoLink>
                }
              >
                Internação ativa desde {formatarDataHora(jaInternado.dataEntrada)}. Registre a alta ou transfira o paciente antes de abrir outra.
              </Alerta>
            )}
          </Secao>

          <Secao titulo="Responsável" descricao="Profissional da saúde que acompanha a internação.">
            <Campo rotulo="Profissional responsável" obrigatorio erro={erro('profissional')}>
              {(p) => (
                <Selecao {...p} value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)} required>
                  <option value="">Selecione o profissional…</option>
                  {profissionais.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} · {nomeEspecialidade(prof)}
                    </option>
                  ))}
                </Selecao>
              )}
            </Campo>
          </Secao>

          <Secao titulo="Quarto" descricao="A situação é derivada da ocupação. Lotados e bloqueados não recebem pacientes (RN4, RN5).">
            <div>
              <GradeQuartos quartos={quartos} valor={quartoId} aoMudar={setQuartoId} invalido={Boolean(erro('quarto'))} />
              {erro('quarto') ? (
                <p className={s.quartoErro}>{erro('quarto')}</p>
              ) : quarto ? (
                <p className={cn(s.quartoResumo, 'tabular')}>
                  Quarto <span className={s.codigo}>{quarto.numero}</span> · {tiposQuarto[quarto.tipo].rotulo} — após a internação, {quarto.ocupacao + 1}/{quarto.capacidadeMaxima}{' '}
                  {quarto.ocupacao + 1 === quarto.capacidadeMaxima ? '(o quarto passa a lotado)' : 'ocupado'}.
                </p>
              ) : null}
            </div>
          </Secao>

          <Secao titulo="Período" descricao="A alta prevista é uma estimativa; a efetiva é registrada no encerramento.">
            <Campo rotulo="Data e hora de entrada" obrigatorio erro={erro('entrada')} colunas={3}>
              {(p) => <Entrada {...p} type="datetime-local" mono value={entrada} onChange={(e) => setEntrada(e.target.value)} required />}
            </Campo>
            <Campo
              rotulo="Alta prevista"
              obrigatorio
              erro={erro('alta')}
              ajuda={dataEntrada ? `A partir de ${formatarData(dataEntrada)}.` : undefined}
              colunas={3}
            >
              {(p) => <Entrada {...p} type="date" mono value={alta} min={dataEntrada || undefined} onChange={(e) => setAlta(e.target.value)} required />}
            </Campo>
          </Secao>

          <Secao titulo="Motivo">
            <Campo rotulo="Motivo da internação" obrigatorio erro={erro('motivo')}>
              {(p) => <Entrada {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: Pneumonia adquirida na comunidade" required />}
            </Campo>
            <Campo rotulo="Observações">
              {(p) => <AreaTexto {...p} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />}
            </Campo>
          </Secao>
        </Cartao>

        <div className={s.acoes}>
          {bloqueado && <p className={s.bloqueio}>Corrija os pontos em vermelho para continuar.</p>}
          <BotaoLink to="/internacoes">Cancelar</BotaoLink>
          <Botao type="submit" variante="primario" icone={<BedDouble />} disabled={bloqueado}>
            Registrar internação
          </Botao>
        </div>
      </form>
    </Pagina>
  )
}

interface GradeQuartosProps {
  quartos: QuartoComOcupacao[]
  valor: number | null
  aoMudar: (id: number) => void
  invalido?: boolean
}

/** Seleção de quarto em grade, com semântica de radio e navegação por setas entre os quartos que aceitam paciente. */
function GradeQuartos({ quartos, valor, aoMudar, invalido }: GradeQuartosProps) {
  const refs = useRef(new Map<number, HTMLButtonElement>())
  const andares = [...new Set(quartos.map((q) => q.andar))].sort()
  const ordenados = andares.flatMap((a) => quartos.filter((q) => q.andar === a))
  const habilitados = ordenados.filter(podeReceber)
  const focavel = valor ?? habilitados[0]?.id

  const teclar = (e: KeyboardEvent, id: number) => {
    const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!passo) return
    e.preventDefault()
    const i = habilitados.findIndex((q) => q.id === id)
    const proximo = habilitados[(i + passo + habilitados.length) % habilitados.length]
    aoMudar(proximo.id)
    refs.current.get(proximo.id)?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Quarto" aria-required aria-invalid={invalido} className={s.grade}>
      {andares.map((andar) => {
        const doAndar = ordenados.filter((q) => q.andar === andar)
        const vagas = doAndar.reduce((t, q) => t + q.vagas, 0)
        return (
          <div key={andar} role="group" aria-label={`${andar}º andar`}>
            <p className={s.andarTopo}>
              {andar}º andar
              <span className={cn(s.andarVagas, 'tabular')}>{plural(vagas, 'vaga livre', 'vagas livres')}</span>
            </p>
            <div className={s.quartos}>
              {doAndar.map((q) => {
                const ok = podeReceber(q)
                const marcado = q.id === valor
                return (
                  <button
                    key={q.id}
                    ref={(el) => {
                      if (el) refs.current.set(q.id, el)
                      else refs.current.delete(q.id)
                    }}
                    type="button"
                    role="radio"
                    aria-checked={marcado}
                    aria-label={`Quarto ${q.numero}, ${tiposQuarto[q.tipo].rotulo}, ${ok ? plural(q.vagas, 'vaga') : situacaoQuarto[q.situacao].rotulo}`}
                    disabled={!ok}
                    tabIndex={q.id === focavel ? 0 : -1}
                    onClick={() => aoMudar(q.id)}
                    onKeyDown={(e) => teclar(e, q.id)}
                    className={s.quarto}
                  >
                    <span className={s.quartoTopo}>
                      <span className={cn(s.quartoNumero, 'tabular')}>{q.numero}</span>
                      <span className={s.quartoTipo} title={tiposQuarto[q.tipo].rotulo}>
                        {tiposQuarto[q.tipo].curto}
                      </span>
                    </span>
                    <PontosOcupacao ocupacao={q.ocupacao} capacidade={q.capacidadeMaxima} situacao={q.situacao} tamanho="sm" />
                    {ok ? (
                      <span className={cn(s.quartoVagas, 'tabular')}>{plural(q.vagas, 'vaga')}</span>
                    ) : (
                      <Selo tom={situacaoQuarto[q.situacao].tom} compacto className={s.seloQuarto}>
                        {situacaoQuarto[q.situacao].rotulo}
                      </Selo>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {habilitados.length === 0 && (
        <p className={s.semQuartos}>
          Nenhum quarto com vaga agora. Confira o <Link to="/quartos" className={s.linkMapa}>mapa de quartos</Link>.
        </p>
      )}
    </div>
  )
}
