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
  BotaoSegurar,
} from '@/ds'
import { Pessoa, RegistrosClinicos, SeloInternacao, SeloQuarto, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { buscarInternacao, buscarPaciente, buscarProfissional, buscarQuarto, listarQuartos, listarRegistros, type QuartoComOcupacao } from '@/api'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import type { Internacao, TipoRegistro } from '@/tipos/dominio'
import type { Tom } from '@/lib/rotulos'
import { hoje, idade } from '@/lib/datas'
import { formatarData, formatarDataHora, formatarTelefone, plural } from '@/lib/formato'
import { situacaoQuarto, tiposQuarto, tiposRegistro } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { agora, prazoDaAlta } from './utilidades'
import s from './DetalheInternacao.module.css'
import { CpfProtegido } from '@/componentes/CpfProtegido'

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
  const prazo = prazoDaAlta(internacao.dataPrevistaAlta)
  const tomPrazo: Tom | undefined = prazo.atrasada ? 'danger' : internacao.dataPrevistaAlta === hoje() ? 'warn' : undefined

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Internações', para: '/internacoes' }, { rotulo: paciente.nome }]}
        antes={<Avatar nome={paciente.nome} tamanho="lg" className={s.avatarCabecalho} />}
        titulo={paciente.nome}
        descricao={
          <span className={s.descricaoLinha}>
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

      <div className={s.colunas}>
        <div className={s.coluna}>
          <Cartao>
            <h2 className="sr-only">Permanência</h2>
            <dl className={s.permanencia}>
              <Numero rotulo="Entrada" valor={formatarData(dataEntrada)} detalhe={`às ${horaEntrada}`} />
              {ativa ? (
                <Numero
                  rotulo="Alta prevista"
                  valor={formatarData(internacao.dataPrevistaAlta)}
                  detalhe={prazo.texto}
                  tomDetalhe={tomPrazo}
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
                  <Link to={`/quartos/${quarto.id}`} className={s.linkQuarto}>
                    {quarto.numero}
                  </Link>
                }
                detalhe={`${quarto.andar}º andar · ${tiposQuarto[quarto.tipo].rotulo}`}
              />
            </dl>
            {internacao.observacoes && (
              <div className={s.observacoes}>
                <p className={s.observacoesRotulo}>Observações</p>
                <p className={s.observacoesTexto}>{internacao.observacoes}</p>
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

        <aside className={s.coluna} aria-label="Envolvidos na internação">
          <Cartao>
            <CabecalhoCartao titulo="Paciente" icone={<User />} />
            <CorpoCartao className={s.corpoPaciente}>
              <Pessoa nome={paciente.nome} para={`/pacientes/${paciente.id}`} detalhe={paciente.email} tamanho="lg" />
              <ListaDefinicao
                itens={[
                  { rotulo: 'CPF', valor: <CpfProtegido cpf={paciente.cpf} /> },
                  { rotulo: 'Idade', valor: `${idade(paciente.dataNascimento)} anos` },
                  { rotulo: 'Telefone', valor: formatarTelefone(paciente.telefone), mono: true },
                  { rotulo: 'Nascimento', valor: formatarData(paciente.dataNascimento) },
                ]}
              />
              <BotaoLink to={`/pacientes/${paciente.id}?aba=historico`} tamanho="sm" icone={<History />} className={s.verHistorico}>
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
              <div className={s.quartoTopo}>
                <div>
                  <p className={cn(s.quartoNumero, 'tabular')}>{quarto.numero}</p>
                  <p className={s.quartoAndar}>{quarto.andar}º andar</p>
                </div>
                <div className={s.quartoSelos}>
                  <Etiqueta>{tiposQuarto[quarto.tipo].rotulo}</Etiqueta>
                  <SeloQuarto situacao={quarto.situacao} />
                </div>
              </div>
              <div className={s.quartoOcupacao}>
                <PontosOcupacao ocupacao={quarto.ocupacao} capacidade={quarto.capacidadeMaxima} situacao={quarto.situacao} />
                <span className={cn(s.quartoVagas, 'tabular')}>
                  {quarto.ocupacao}/{quarto.capacidadeMaxima} · {plural(quarto.vagas, 'vaga')}
                </span>
              </div>
            </CorpoCartao>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Responsável" icone={<Stethoscope />} />
            <CorpoCartao>
              <Pessoa nome={prof.nome} para={`/profissionais/${prof.id}`} detalhe={nomeEspecialidade(prof)} />
              <p className={cn(s.registroProfissional, 'tabular')}>{prof.registroProfissional}</p>
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

function Numero({ rotulo, valor, detalhe, tomDetalhe }: { rotulo: string; valor: ReactNode; detalhe?: ReactNode; tomDetalhe?: Tom }) {
  return (
    <div className={s.numero}>
      <dt className={s.numeroRotulo}>{rotulo}</dt>
      <dd className={cn(s.numeroValor, 'tabular')}>{valor}</dd>
      {detalhe && (
        <dd data-tom={tomDetalhe} className={s.numeroDetalhe}>
          {detalhe}
        </dd>
      )}
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

  // Enter no formulário não confirma: a alta só sai segurando o botão
  const enviar = (e: FormEvent) => e.preventDefault()
  const confirmar = () => {
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
          <BotaoSegurar variante="primario" icone={<LogOut />} disabled={invalida} feito="Alta registrada" aoConfirmar={confirmar}>
            Segure para dar alta
          </BotaoSegurar>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} className={s.formulario} noValidate>
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
          <ul className={s.consequencias}>
            <li>A internação continua no histórico do paciente, com status Alta concedida — nada é apagado (RN6).</li>
            <li>
              A vaga no quarto <span className={s.codigo}>{quarto.numero}</span> é liberada e a situação do quarto é recalculada (RN5).
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
          Hoje no quarto <span className={s.codigo}>{quarto.numero}</span> · {tiposQuarto[quarto.tipo].rotulo}, {quarto.andar}º andar.
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
      <form id={idForm} onSubmit={enviar} className={s.formulario} noValidate>
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
          <div className={s.destino}>
            <div className={s.destinoTopo}>
              <p className={s.destinoTitulo}>
                Quarto <span className={s.codigo}>{destino.numero}</span>
                <span className={s.destinoAndar}> · {destino.andar}º andar</span>
              </p>
              <SeloQuarto situacao={destino.situacao} />
            </div>
            <div className={s.destinoOcupacao}>
              <PontosOcupacao ocupacao={destino.ocupacao} capacidade={destino.capacidadeMaxima} situacao={destino.situacao} />
              <span className="tabular">
                Capacidade {destino.capacidadeMaxima} · ocupação {destino.ocupacao} · {plural(destino.vagas, 'vaga')}
              </span>
            </div>
            {disponivel(destino) && (
              <p className={cn(s.destinoDepois, 'tabular')}>
                Após a transferência: {destino.ocupacao + 1}/{destino.capacidadeMaxima} no {destino.numero} e uma vaga liberada no {quarto.numero}.
              </p>
            )}
          </div>
        )}

        <Campo rotulo="Motivo da transferência">{(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={s.motivo} />}</Campo>
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
      <form id={idForm} onSubmit={enviar} className={s.formulario} noValidate>
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
          {(p) => <AreaTexto {...p} value={descricao} onChange={(e) => setDescricao(e.target.value)} className={s.descricao} required />}
        </Campo>
      </form>
    </Modal>
  )
}
