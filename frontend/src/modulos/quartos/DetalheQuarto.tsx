import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { BedDouble, DoorOpen, History, Lock, LockOpen, Plus, Wrench } from 'lucide-react'
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
  EstadoVazio,
  Etiqueta,
  Linha,
  ListaDefinicao,
  Modal,
  Pagina,
  PontosOcupacao,
  Segmentado,
  Tabela,
  Td,
  Th,
  usePrototipo,
} from '@/ds'
import { Pessoa, SeloInternacao, SeloQuarto, diasInternado } from '@/componentes/dominio'
import { buscarPaciente, buscarQuarto, listarInternacoes, type QuartoComOcupacao } from '@/api'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import type { Internacao, Quarto } from '@/tipos/dominio'
import { formatarData, formatarDataHora, plural, relativo } from '@/lib/formato'
import { hoje } from '@/lib/datas'
import { situacaoQuarto, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import s from './DetalheQuarto.module.css'

type Bloqueio = NonNullable<Quarto['bloqueio']>

export function DetalheQuarto() {
  const { id } = useParams()
  const [modal, setModal] = useState<'bloquear' | 'liberar' | null>(null)
  const fechar = useCallback(() => setModal(null), [])

  const quarto = buscarQuarto(Number(id))
  if (!quarto) return <NaoEncontrada titulo="Quarto não encontrado" voltarPara="/quartos" voltarRotulo="Voltar aos quartos" />

  const historico = listarInternacoes({ quartoId: quarto.id })
  const ativas = historico.filter((i) => i.status === 'ATIVA')
  const vagasLivres = Math.max(0, quarto.capacidadeMaxima - ativas.length)

  return (
    <Pagina>
      <CabecalhoPagina
        migalhas={[{ rotulo: 'Quartos', para: '/quartos' }, { rotulo: `Quarto ${quarto.numero}` }]}
        titulo={
          <>
            Quarto <span className={s.numeroTitulo}>{quarto.numero}</span>
          </>
        }
        descricao={
          <span className={s.descricaoLinha}>
            <Etiqueta>{tiposQuarto[quarto.tipo].rotulo}</Etiqueta>
            <span>{quarto.andar}º andar</span>
            <SeloQuarto situacao={quarto.situacao} />
          </span>
        }
        acoes={
          quarto.bloqueio ? (
            <Botao variante="primario" icone={<LockOpen />} onClick={() => setModal('liberar')}>
              Liberar quarto
            </Botao>
          ) : (
            <Botao icone={<Wrench />} onClick={() => setModal('bloquear')}>
              Colocar em manutenção
            </Botao>
          )
        }
      />

      <div className={s.colunas}>
        <div className={s.coluna}>
          <Cartao>
            <CabecalhoCartao
              titulo="Ocupação"
              icone={<BedDouble />}
              descricao={`${ativas.length} de ${quarto.capacidadeMaxima} ${quarto.capacidadeMaxima === 1 ? 'vaga ocupada' : 'vagas ocupadas'}${quarto.bloqueio ? ' · quarto bloqueado' : ''}`}
              acoes={<PontosOcupacao ocupacao={quarto.ocupacao} capacidade={quarto.capacidadeMaxima} situacao={quarto.situacao} />}
            />
            <CorpoCartao>
              <ul className={s.vagas}>
                {ativas.map((i, n) => (
                  <li key={i.id} className={s.celula}>
                    <VagaOcupada internacao={i} posicao={n + 1} />
                  </li>
                ))}
                {Array.from({ length: vagasLivres }, (_, n) => (
                  <li key={`livre-${n}`} className={s.celula}>
                    <VagaLivre quarto={quarto} posicao={ativas.length + n + 1} />
                  </li>
                ))}
              </ul>
            </CorpoCartao>
          </Cartao>

          <Cartao className={s.historico}>
            <CabecalhoCartao titulo="Histórico de ocupação" icone={<History />} descricao="Todas as internações que passaram por este quarto. Nada é apagado (RN6)." />
            {historico.length === 0 ? (
              <EstadoVazio icone={<History />} titulo="Nenhuma internação neste quarto" descricao="Quando alguém for internado aqui, a passagem fica registrada nesta lista." />
            ) : (
              <Tabela>
                <caption className="sr-only">Histórico de ocupação do quarto {quarto.numero}</caption>
                <thead>
                  <tr>
                    <Th scope="col">Paciente</Th>
                    <Th scope="col">Entrada</Th>
                    <Th scope="col">Saída</Th>
                    <Th scope="col">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((i) => {
                    const p = buscarPaciente(i.pacienteId)!
                    return (
                      <Linha key={i.id} para={`/internacoes/${i.id}`}>
                        <Td className={s.celulaPaciente}>
                          <Link to={`/internacoes/${i.id}`} className={s.linkPaciente} aria-label={`Internação de ${p.nome}`}>
                            <Pessoa nome={p.nome} tamanho="sm" detalhe={i.motivo} />
                          </Link>
                        </Td>
                        <Td className={cn(s.celulaData, 'tabular')}>{formatarDataHora(i.dataEntrada)}</Td>
                        <Td className={cn(s.celulaData, 'tabular')}>
                          {i.dataEfetivaAlta ? formatarDataHora(i.dataEfetivaAlta) : <span className={s.semSaida}>{i.status === 'ATIVA' ? 'em curso' : '—'}</span>}
                        </Td>
                        <Td>
                          <SeloInternacao status={i.status} />
                        </Td>
                      </Linha>
                    )
                  })}
                </tbody>
              </Tabela>
            )}
          </Cartao>
        </div>

        <aside className={s.coluna} aria-label="Ficha do quarto">
          <Cartao>
            <CabecalhoCartao titulo="Ficha" icone={<DoorOpen />} />
            <CorpoCartao>
              <ListaDefinicao
                itens={[
                  { rotulo: 'Número', valor: quarto.numero, mono: true },
                  { rotulo: 'Andar', valor: `${quarto.andar}º` },
                  { rotulo: 'Tipo', valor: tiposQuarto[quarto.tipo].rotulo },
                  { rotulo: 'Capacidade máxima', valor: plural(quarto.capacidadeMaxima, 'paciente') },
                  { rotulo: 'Ocupação atual', valor: `${quarto.ocupacao} de ${quarto.capacidadeMaxima}` },
                  { rotulo: 'Vagas', valor: quarto.bloqueio ? `0 · ${situacaoQuarto[quarto.bloqueio].rotulo.toLowerCase()}` : quarto.vagas },
                ]}
              />
            </CorpoCartao>
          </Cartao>
          <Alerta titulo="A situação é recalculada a cada internação e alta">
            Ocupação é contada a partir das internações ativas, nunca digitada, e o quarto nunca passa da capacidade máxima (RN5). Só manutenção e interdição são decisões administrativas.
          </Alerta>
        </aside>
      </div>

      {modal === 'bloquear' && <ModalBloquear quarto={quarto} aoFechar={fechar} />}
      {modal === 'liberar' && <ModalLiberar quarto={quarto} aoFechar={fechar} />}
    </Pagina>
  )
}

function VagaOcupada({ internacao: i, posicao }: { internacao: Internacao; posicao: number }) {
  const p = buscarPaciente(i.pacienteId)!
  const dias = diasInternado(i)
  const dia = hoje()
  const atrasada = i.dataPrevistaAlta < dia
  return (
    <Link
      to={`/internacoes/${i.id}`}
      className={s.vaga}
    >
      <p className={s.vagaRotulo}>Vaga {posicao}</p>
      <Pessoa nome={p.nome} detalhe={i.motivo} />
      <div className={s.vagaRodape}>
        <span className={cn(s.dias, 'tabular')}>{dias === 0 ? 'entrou hoje' : `${plural(dias, 'dia')} internado`}</span>
        <span data-tom={atrasada ? 'danger' : i.dataPrevistaAlta === dia ? 'warn' : undefined} className={cn(s.alta, 'tabular')}>
          Alta {atrasada ? `atrasada (${formatarData(i.dataPrevistaAlta)})` : relativo(i.dataPrevistaAlta)}
        </span>
      </div>
    </Link>
  )
}

function VagaLivre({ quarto, posicao }: { quarto: QuartoComOcupacao; posicao: number }) {
  const bloqueado = Boolean(quarto.bloqueio)
  return (
    <div className={s.vagaLivre}>
      <p className={s.vagaRotulo}>Vaga {posicao}</p>
      {bloqueado ? (
        <>
          <p className={s.livreTitulo}>
            <Lock aria-hidden />
            Bloqueada
          </p>
          <p className={s.livreNota}>Quarto em {situacaoQuarto[quarto.bloqueio!].rotulo.toLowerCase()} — não recebe pacientes.</p>
        </>
      ) : (
        <>
          <p className={s.livreTitulo}>Vaga livre</p>
          <BotaoLink to={`/internacoes/nova?quartoId=${quarto.id}`} variante="fantasma" tamanho="sm" icone={<Plus />} className={s.internarAqui}>
            Internar aqui
          </BotaoLink>
        </>
      )}
    </div>
  )
}

function ModalBloquear({ quarto, aoFechar }: { quarto: QuartoComOcupacao; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const idForm = useId()
  const [bloqueio, setBloqueio] = useState<Bloqueio>('MANUTENCAO')
  const [motivo, setMotivo] = useState('')
  const temPacientes = quarto.ocupacao > 0

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (temPacientes) return
    prototipo(bloqueio === 'MANUTENCAO' ? 'Quarto em manutenção' : 'Quarto interditado')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={`Bloquear o quarto ${quarto.numero}`}
      descricao="Um quarto bloqueado deixa de receber internações até ser liberado."
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form={idForm} variante={bloqueio === 'INTERDITADO' ? 'perigo' : 'primario'} icone={<Lock />} disabled={temPacientes}>
            {bloqueio === 'MANUTENCAO' ? 'Colocar em manutenção' : 'Interditar'}
          </Botao>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} noValidate className={s.formulario}>
        <div className={s.grupo}>
          <span className={s.grupoRotulo}>Situação</span>
          <Segmentado
            rotulo="Situação do bloqueio"
            valor={bloqueio}
            aoMudar={setBloqueio}
            className={s.segmentado}
            opcoes={[
              { valor: 'MANUTENCAO', rotulo: situacaoQuarto.MANUTENCAO.rotulo },
              { valor: 'INTERDITADO', rotulo: situacaoQuarto.INTERDITADO.rotulo },
            ]}
          />
        </div>
        {temPacientes && (
          <Alerta tom="danger" titulo="Há pacientes internados neste quarto">
            {plural(quarto.ocupacao, 'internação ativa', 'internações ativas')} no quarto {quarto.numero}. Transfira os pacientes ou registre as altas antes de bloqueá-lo — o servidor recusaria a mudança (409).
          </Alerta>
        )}
        <Campo rotulo="Motivo" ajuda="Ex.: troca de rede de gases, desinfecção terminal.">
          {(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={s.motivo} disabled={temPacientes} />}
        </Campo>
      </form>
    </Modal>
  )
}

function ModalLiberar({ quarto, aoFechar }: { quarto: QuartoComOcupacao; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const liberar = () => {
    prototipo('Quarto liberado')
    aoFechar()
  }
  return (
    <Modal
      aberto
      largura="sm"
      aoFechar={aoFechar}
      titulo={`Liberar o quarto ${quarto.numero}?`}
      descricao={
        <>
          Hoje em {situacaoQuarto[quarto.situacao].rotulo.toLowerCase()}. Ao liberar, o quarto volta a receber internações e a situação passa a ser derivada da ocupação —{' '}
          {plural(quarto.capacidadeMaxima - quarto.ocupacao, 'vaga')} {quarto.capacidadeMaxima - quarto.ocupacao === 1 ? 'fica disponível' : 'ficam disponíveis'}.
        </>
      }
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao variante="primario" icone={<LockOpen />} onClick={liberar}>
            Liberar quarto
          </Botao>
        </>
      }
    />
  )
}
