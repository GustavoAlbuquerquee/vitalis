import { useCallback, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeftRight, ArrowRight, ClipboardList, DoorOpen, History, LogOut, Plus, Stethoscope, User } from 'lucide-react'
import {
  Alerta,
  AreaTexto,
  Avatar,
  Botao,
  BotaoLink,
  CabecalhoCartao,
  CabecalhoPagina,
  Campo,
  Cartao,
  CorpoCartao,
  Entrada,
  Etiqueta,
  ListaDefinicao,
  Modal,
  Pagina,
  PontosOcupacao,
  Selecao,
  usePrototipo,
} from '@/ds'
import { Pessoa, RegistrosClinicos, SeloInternacao, SeloQuarto, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { buscarInternacao, buscarPaciente, buscarProfissional, buscarQuarto, listarQuartos, listarRegistros, type QuartoComOcupacao } from '@/api'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import type { Internacao, TipoRegistro } from '@/tipos/dominio'
import { idade } from '@/lib/datas'
import { formatarCpf, formatarData, formatarDataHora, formatarTelefone, plural } from '@/lib/formato'
import { situacaoQuarto, tiposQuarto, tiposRegistro } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { agora, prazoDaAlta } from './utilidades'

type ModalAberto = 'alta' | 'transferir' | 'registro' | null

export function DetalheInternacao() {
  const { id } = useParams()
  const [modal, setModal] = useState<ModalAberto>(null)
  const fechar = useCallback(() => setModal(null), [])

  const internacao = buscarInternacao(Number(id))
  if (!internacao) return <NaoEncontrada titulo="Internação não encontrada" voltarPara="/internacoes" voltarRotulo="Voltar às internações" />

  const paciente = buscarPaciente(internacao.pacienteId)!
  const prof = buscarProfissional(internacao.profissionalId)!
  const quarto = buscarQuarto(internacao.quartoId)!
  const registros = listarRegistros({ tipo: 'internacao', id: internacao.id })
  const ativa = internacao.status === 'ATIVA'
  const dias = diasInternado(internacao)
  const [dataEntrada, horaEntrada] = internacao.dataEntrada.split('T')

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Internações', para: '/internacoes' }, { rotulo: paciente.nome }]}
        antes={<Avatar nome={paciente.nome} tamanho="lg" className="hidden sm:inline-flex" />}
        titulo={paciente.nome}
        descricao={
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>{internacao.motivo}</span>
            <SeloInternacao status={internacao.status} />
          </span>
        }
        acoes={
          ativa && (
            <>
              <Botao icone={<ArrowLeftRight />} onClick={() => setModal('transferir')}>
                Transferir
              </Botao>
              <Botao variante="primario" icone={<LogOut />} onClick={() => setModal('alta')}>
                Registrar alta
              </Botao>
            </>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Cartao>
            <h2 className="sr-only">Permanência</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4">
              <Numero rotulo="Entrada" valor={formatarData(dataEntrada)} detalhe={`às ${horaEntrada}`} />
              {ativa ? (
                <Numero
                  rotulo="Alta prevista"
                  valor={formatarData(internacao.dataPrevistaAlta)}
                  detalhe={prazoDaAlta(internacao.dataPrevistaAlta).texto}
                  tomDetalhe={prazoDaAlta(internacao.dataPrevistaAlta).cor}
                />
              ) : (
                <Numero
                  rotulo="Alta efetiva"
                  valor={internacao.dataEfetivaAlta ? formatarData(internacao.dataEfetivaAlta) : '—'}
                  detalhe={internacao.dataEfetivaAlta ? `prevista ${formatarData(internacao.dataPrevistaAlta)}` : 'sem alta registrada'}
                />
              )}
              <Numero rotulo={ativa ? 'Dias internado' : 'Permanência'} valor={dias} detalhe={dias === 1 ? 'dia' : 'dias'} />
              <Numero
                rotulo="Quarto"
                valor={
                  <Link to={`/quartos/${quarto.id}`} className="font-mono hover:underline hover:underline-offset-4">
                    {quarto.numero}
                  </Link>
                }
                detalhe={`${quarto.andar}º andar · ${tiposQuarto[quarto.tipo].rotulo}`}
              />
            </dl>
            {internacao.observacoes && (
              <div className="border-t border-line px-5 py-3.5">
                <p className="text-xs font-medium text-ink-3">Observações</p>
                <p className="mt-0.5 text-sm text-ink-2">{internacao.observacoes}</p>
              </div>
            )}
          </Cartao>

          <Cartao>
            <CabecalhoCartao
              titulo="Registros clínicos"
              icone={<ClipboardList />}
              descricao={ativa ? `${plural(registros.length, 'registro')} nesta internação` : 'Internação encerrada — registros preservados no histórico (RN6)'}
              acoes={
                ativa && (
                  <Botao tamanho="sm" icone={<Plus />} onClick={() => setModal('registro')}>
                    Novo registro
                  </Botao>
                )
              }
            />
            <CorpoCartao>
              <RegistrosClinicos registros={registros} />
            </CorpoCartao>
          </Cartao>
        </div>

        <aside className="flex min-w-0 flex-col gap-6" aria-label="Envolvidos na internação">
          <Cartao>
            <CabecalhoCartao titulo="Paciente" icone={<User />} />
            <CorpoCartao className="flex flex-col gap-4">
              <Pessoa nome={paciente.nome} para={`/pacientes/${paciente.id}`} detalhe={paciente.email} tamanho="lg" />
              <ListaDefinicao
                itens={[
                  { rotulo: 'CPF', valor: formatarCpf(paciente.cpf), mono: true },
                  { rotulo: 'Idade', valor: `${idade(paciente.dataNascimento)} anos` },
                  { rotulo: 'Telefone', valor: formatarTelefone(paciente.telefone), mono: true },
                  { rotulo: 'Nascimento', valor: formatarData(paciente.dataNascimento) },
                ]}
              />
              <BotaoLink to={`/pacientes/${paciente.id}?aba=historico`} tamanho="sm" icone={<History />} className="self-start">
                Ver histórico
              </BotaoLink>
            </CorpoCartao>
          </Cartao>

          <Cartao>
            <CabecalhoCartao
              titulo="Quarto"
              icone={<DoorOpen />}
              acoes={
                <BotaoLink to={`/quartos/${quarto.id}`} variante="fantasma" tamanho="sm" iconeDireita={<ArrowRight />}>
                  Abrir
                </BotaoLink>
              }
            />
            <CorpoCartao>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-2xl font-semibold tracking-[-0.02em] tabular">{quarto.numero}</p>
                  <p className="text-sm text-ink-3">{quarto.andar}º andar</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Etiqueta>{tiposQuarto[quarto.tipo].rotulo}</Etiqueta>
                  <SeloQuarto situacao={quarto.situacao} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
                <PontosOcupacao ocupacao={quarto.ocupacao} capacidade={quarto.capacidadeMaxima} situacao={quarto.situacao} />
                <span className="text-sm text-ink-2 tabular">
                  {quarto.ocupacao}/{quarto.capacidadeMaxima} · {plural(quarto.vagas, 'vaga')}
                </span>
              </div>
            </CorpoCartao>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Responsável" icone={<Stethoscope />} />
            <CorpoCartao>
              <Pessoa nome={prof.nome} para={`/profissionais/${prof.id}`} detalhe={nomeEspecialidade(prof)} />
              <p className="mt-3 font-mono text-sm text-ink-2 tabular">{prof.registroProfissional}</p>
            </CorpoCartao>
          </Cartao>
        </aside>
      </div>

      {modal === 'alta' && <ModalAlta internacao={internacao} quarto={quarto} aoFechar={fechar} />}
      {modal === 'transferir' && <ModalTransferir quarto={quarto} aoFechar={fechar} />}
      {modal === 'registro' && <ModalRegistro aoFechar={fechar} />}
    </Pagina>
  )
}

function Numero({ rotulo, valor, detalhe, tomDetalhe }: { rotulo: string; valor: ReactNode; detalhe?: ReactNode; tomDetalhe?: string }) {
  return (
    <div className="min-w-0 border-line px-5 py-4 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+2)]:border-l sm:[&:nth-child(n+3)]:border-t-0 [&:nth-child(even)]:border-l">
      <dt className="text-xs font-medium text-ink-3">{rotulo}</dt>
      <dd className="mt-1 truncate text-xl font-semibold tracking-[-0.015em] tabular">{valor}</dd>
      {detalhe && <dd className={cn('mt-0.5 truncate text-xs', tomDetalhe ?? 'text-ink-3')}>{detalhe}</dd>}
    </div>
  )
}

function ModalAlta({ internacao, quarto, aoFechar }: { internacao: Internacao; quarto: QuartoComOcupacao; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const idForm = useId()
  const [data, setData] = useState(agora)
  const [observacoes, setObservacoes] = useState('')
  const anterior = Boolean(data) && data < internacao.dataEntrada
  const invalida = !data || anterior

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (invalida) return
    prototipo('Alta registrada')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Registrar alta"
      descricao={`Encerra a internação iniciada em ${formatarDataHora(internacao.dataEntrada)}.`}
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form={idForm} variante="primario" icone={<LogOut />} disabled={invalida}>
            Registrar alta
          </Botao>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Campo rotulo="Data e hora da alta" obrigatorio erro={!data ? 'Informe quando a alta aconteceu.' : undefined} ajuda="Alta efetiva — quando o paciente de fato deixou o quarto.">
          {(p) => <Entrada {...p} type="datetime-local" mono value={data} min={internacao.dataEntrada} onChange={(e) => setData(e.target.value)} required />}
        </Campo>
        {anterior && (
          <Alerta tom="danger" titulo="A alta não pode ser anterior à entrada">
            A entrada foi em {formatarDataHora(internacao.dataEntrada)}. O servidor recusaria esta data (422 · data de alta inválida).
          </Alerta>
        )}
        <Campo rotulo="Observações" ajuda="Orientações de alta, retorno ambulatorial, receitas.">
          {(p) => <AreaTexto {...p} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />}
        </Campo>
        <Alerta titulo="O que acontece ao registrar a alta">
          <ul className="list-disc space-y-0.5 pl-4">
            <li>A internação continua no histórico do paciente, com status Alta concedida — nada é apagado (RN6).</li>
            <li>
              A vaga no quarto <span className="font-mono">{quarto.numero}</span> é liberada e a situação do quarto é recalculada (RN5).
            </li>
          </ul>
        </Alerta>
      </form>
    </Modal>
  )
}

const motivoIndisponivel = (q: QuartoComOcupacao) => `(${situacaoQuarto[q.situacao].rotulo.toLowerCase()})`

function ModalTransferir({ quarto, aoFechar }: { quarto: QuartoComOcupacao; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const idForm = useId()
  const [destinoId, setDestinoId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [tentou, setTentou] = useState(false)

  const quartos = listarQuartos().filter((q) => q.id !== quarto.id)
  const andares = [...new Set(quartos.map((q) => q.andar))].sort()
  const destino = quartos.find((q) => q.id === Number(destinoId))
  const disponivel = (q: QuartoComOcupacao) => q.situacao === 'DISPONIVEL' && q.vagas > 0

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    if (!destino || !disponivel(destino)) return
    prototipo('Paciente transferido')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Transferir de quarto"
      descricao={
        <>
          Hoje no quarto <span className="font-mono">{quarto.numero}</span> · {tiposQuarto[quarto.tipo].rotulo}, {quarto.andar}º andar.
        </>
      }
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form={idForm} variante="primario" icone={<ArrowLeftRight />} disabled={Boolean(destino) && !disponivel(destino!)}>
            Transferir
          </Botao>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Campo
          rotulo="Quarto de destino"
          obrigatorio
          erro={tentou && !destino ? 'Escolha o quarto para onde o paciente vai.' : undefined}
          ajuda="Quartos lotados ou bloqueados aparecem, mas não podem ser escolhidos (RN4)."
        >
          {(p) => (
            <Selecao {...p} value={destinoId} onChange={(e) => setDestinoId(e.target.value)} required>
              <option value="">Selecione um quarto…</option>
              {andares.map((andar) => (
                <optgroup key={andar} label={`${andar}º andar`}>
                  {quartos
                    .filter((q) => q.andar === andar)
                    .map((q) => (
                      <option key={q.id} value={q.id} disabled={!disponivel(q)}>
                        {q.numero} · {tiposQuarto[q.tipo].rotulo} · {disponivel(q) ? plural(q.vagas, 'vaga') : motivoIndisponivel(q)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Selecao>
          )}
        </Campo>

        {destino && (
          <div className="rounded-card border border-line bg-surface-2/50 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                Quarto <span className="font-mono">{destino.numero}</span>
                <span className="font-normal text-ink-3"> · {destino.andar}º andar</span>
              </p>
              <SeloQuarto situacao={destino.situacao} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-2">
              <PontosOcupacao ocupacao={destino.ocupacao} capacidade={destino.capacidadeMaxima} situacao={destino.situacao} />
              <span className="tabular">
                Capacidade {destino.capacidadeMaxima} · ocupação {destino.ocupacao} · {plural(destino.vagas, 'vaga')}
              </span>
            </div>
            {disponivel(destino) && (
              <p className="mt-2 text-xs text-ink-3 tabular">
                Após a transferência: {destino.ocupacao + 1}/{destino.capacidadeMaxima} no {destino.numero} e uma vaga liberada no {quarto.numero}.
              </p>
            )}
          </div>
        )}

        <Campo rotulo="Motivo da transferência">{(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-20" />}</Campo>
      </form>
    </Modal>
  )
}

const tipos = Object.entries(tiposRegistro) as [TipoRegistro, (typeof tiposRegistro)[TipoRegistro]][]

function ModalRegistro({ aoFechar }: { aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const idForm = useId()
  const [tipo, setTipo] = useState<TipoRegistro>('EVOLUCAO')
  const [descricao, setDescricao] = useState('')
  const [tentou, setTentou] = useState(false)
  const erro = tentou && !descricao.trim() ? 'Descreva o registro clínico.' : undefined

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    if (!descricao.trim()) return
    prototipo('Registro clínico adicionado')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Novo registro clínico"
      descricao="Fica gravado com autor, data e hora — e não pode ser alterado depois."
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form={idForm} variante="primario" icone={<Plus />}>
            Adicionar registro
          </Botao>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Campo rotulo="Tipo" obrigatorio>
          {(p) => (
            <Selecao {...p} value={tipo} onChange={(e) => setTipo(e.target.value as TipoRegistro)}>
              {tipos.map(([valor, t]) => (
                <option key={valor} value={valor}>
                  {t.rotulo}
                </option>
              ))}
            </Selecao>
          )}
        </Campo>
        <Campo rotulo="Descrição" obrigatorio erro={erro}>
          {(p) => <AreaTexto {...p} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="min-h-32" required />}
        </Campo>
      </form>
    </Modal>
  )
}
