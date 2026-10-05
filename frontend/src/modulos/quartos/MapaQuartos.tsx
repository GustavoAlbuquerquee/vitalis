import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { BedDouble, DoorClosed, DoorOpen, Plus, SearchX, Wrench } from 'lucide-react'
import {
  BarraProgresso,
  Botao,
  CabecalhoPagina,
  Campo,
  Cartao,
  Entrada,
  EstadoVazio,
  Etiqueta,
  Metrica,
  Modal,
  Pagina,
  Pilulas,
  PontosOcupacao,
  Selecao,
  tons,
  usePrototipo,
} from '@/ds'
import { SeloQuarto } from '@/componentes/dominio'
import { buscarPaciente, listarInternacoes, listarQuartos, type QuartoComOcupacao } from '@/api'
import type { SituacaoQuarto, TipoQuarto } from '@/tipos/dominio'
import { plural } from '@/lib/formato'
import { situacaoQuarto, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'

type FiltroSituacao = SituacaoQuarto | 'TODOS'

const situacoes = Object.keys(situacaoQuarto) as SituacaoQuarto[]
const tipos = Object.keys(tiposQuarto) as TipoQuarto[]

export function MapaQuartos() {
  const [situacao, setSituacao] = useState<FiltroSituacao>('TODOS')
  const [tipo, setTipo] = useState<TipoQuarto | ''>('')
  const [novoAberto, setNovoAberto] = useState(false)
  const fecharNovo = useCallback(() => setNovoAberto(false), [])

  const quartos = listarQuartos()
  const ativas = listarInternacoes({ status: 'ATIVA' })
  const ocupantes = (quartoId: number) =>
    ativas
      .filter((i) => i.quartoId === quartoId)
      .map((i) => buscarPaciente(i.pacienteId)?.nome.split(' ')[0])
      .filter(Boolean) as string[]

  const operacionais = quartos.filter((q) => !q.bloqueio)
  const capacidade = operacionais.reduce((s, q) => s + q.capacidadeMaxima, 0)
  const ocupadas = operacionais.reduce((s, q) => s + q.ocupacao, 0)
  const vagas = operacionais.reduce((s, q) => s + q.vagas, 0)
  const lotados = quartos.filter((q) => q.situacao === 'OCUPADO').length
  const emManutencao = quartos.filter((q) => q.situacao === 'MANUTENCAO').length
  const interditados = quartos.filter((q) => q.situacao === 'INTERDITADO').length

  const doTipo = quartos.filter((q) => !tipo || q.tipo === tipo)
  const filtrados = doTipo.filter((q) => situacao === 'TODOS' || q.situacao === situacao)
  const andares = [...new Set(filtrados.map((q) => q.andar))].sort()

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Quartos"
        descricao="Situação derivada da ocupação — nunca digitada."
        acoes={
          <Botao icone={<Plus />} onClick={() => setNovoAberto(true)}>
            Novo quarto
          </Botao>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metrica rotulo="Vagas livres" icone={<BedDouble />} valor={vagas} detalhe={`em ${plural(quartos.filter((q) => q.situacao === 'DISPONIVEL').length, 'quarto disponível', 'quartos disponíveis')}`} />
        <Metrica
          rotulo="Ocupação"
          icone={<DoorOpen />}
          valor={
            <>
              {capacidade ? Math.round((ocupadas / capacidade) * 100) : 0}
              <span className="text-lg text-ink-3">%</span>
            </>
          }
          detalhe={`${ocupadas} de ${capacidade} vagas`}
        >
          <BarraProgresso valor={ocupadas} total={capacidade} />
        </Metrica>
        <Metrica rotulo="Quartos lotados" icone={<DoorClosed />} valor={lotados} detalhe={`de ${plural(operacionais.length, 'quarto operacional', 'quartos operacionais')}`} />
        <Metrica rotulo="Bloqueados" icone={<Wrench />} valor={emManutencao + interditados} detalhe={`${emManutencao} em manutenção · ${plural(interditados, 'interditado')}`} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Pilulas
          rotulo="Filtrar por situação"
          valor={situacao}
          aoMudar={setSituacao}
          opcoes={[
            { valor: 'TODOS' as FiltroSituacao, rotulo: 'Todos', contagem: doTipo.length },
            ...situacoes.map((s) => ({ valor: s as FiltroSituacao, rotulo: situacaoQuarto[s].rotulo, contagem: doTipo.filter((q) => q.situacao === s).length })),
          ]}
        />
        <div className="sm:w-48">
          <Selecao aria-label="Filtrar por tipo de quarto" value={tipo} onChange={(e) => setTipo(e.target.value as TipoQuarto | '')}>
            <option value="">Todos os tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {tiposQuarto[t].rotulo}
              </option>
            ))}
          </Selecao>
        </div>
      </div>

      <Legenda />

      {filtrados.length === 0 ? (
        <Cartao className="mt-6">
          <EstadoVazio
            icone={<SearchX />}
            titulo="Nenhum quarto com esses filtros"
            descricao="Troque a situação ou o tipo para ver outros quartos."
            acao={
              <Botao
                onClick={() => {
                  setSituacao('TODOS')
                  setTipo('')
                }}
              >
                Limpar filtros
              </Botao>
            }
          />
        </Cartao>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {andares.map((andar) => {
            const doAndar = filtrados.filter((q) => q.andar === andar)
            const todosDoAndar = quartos.filter((q) => q.andar === andar && !q.bloqueio)
            const cap = todosDoAndar.reduce((s, q) => s + q.capacidadeMaxima, 0)
            const oc = todosDoAndar.reduce((s, q) => s + q.ocupacao, 0)
            return (
              <section key={andar} aria-labelledby={`andar-${andar}`}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 id={`andar-${andar}`} className="text-md font-semibold">
                    {andar}º andar
                  </h2>
                  <p className="text-sm text-ink-3 tabular">
                    {oc}/{cap} vagas ocupadas · {plural(doAndar.length, 'quarto')}
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {doAndar.map((q) => (
                    <li key={q.id} className="min-w-0">
                      <BlocoQuarto quarto={q} ocupantes={ocupantes(q.id)} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {novoAberto && <ModalNovoQuarto quartos={quartos} aoFechar={fecharNovo} />}
    </Pagina>
  )
}

function BlocoQuarto({ quarto: q, ocupantes }: { quarto: QuartoComOcupacao; ocupantes: string[] }) {
  const bloqueado = Boolean(q.bloqueio)
  return (
    <Link
      to={`/quartos/${q.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-pop"
    >
      <div className={cn('h-[3px] shrink-0', tons[situacaoQuarto[q.situacao].tom].ponto)} aria-hidden />
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="font-mono text-xl font-semibold tracking-[-0.02em] tabular">
            <span className="sr-only">Quarto </span>
            {q.numero}
          </span>
          <Etiqueta>{tiposQuarto[q.tipo].rotulo}</Etiqueta>
        </div>
        <div className="flex flex-col gap-1">
          <PontosOcupacao ocupacao={q.ocupacao} capacidade={q.capacidadeMaxima} situacao={q.situacao} />
          <p className="text-xs text-ink-2 tabular">
            {q.ocupacao}/{q.capacidadeMaxima} · {bloqueado ? 'sem vagas' : plural(q.vagas, 'vaga')}
          </p>
        </div>
        <SeloQuarto situacao={q.situacao} />
        <p className="mt-auto truncate text-xs text-ink-3" title={ocupantes.join(', ') || undefined}>
          {ocupantes.length ? ocupantes.join(', ') : bloqueado ? 'Não recebe pacientes' : 'Nenhum paciente'}
        </p>
      </div>
    </Link>
  )
}

function Legenda() {
  const itens: { rotulo: string; ocupacao: number; situacao: SituacaoQuarto }[] = [
    { rotulo: 'Vaga ocupada', ocupacao: 1, situacao: 'DISPONIVEL' },
    { rotulo: 'Vaga livre', ocupacao: 0, situacao: 'DISPONIVEL' },
    { rotulo: 'Quarto lotado', ocupacao: 1, situacao: 'OCUPADO' },
    { rotulo: 'Bloqueado', ocupacao: 0, situacao: 'MANUTENCAO' },
  ]
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-3">
      <span className="font-medium text-ink-2">Legenda</span>
      {itens.map((i) => (
        <span key={i.rotulo} className="flex items-center gap-1.5">
          <span aria-hidden className="flex">
            <PontosOcupacao ocupacao={i.ocupacao} capacidade={1} situacao={i.situacao} />
          </span>
          {i.rotulo}
        </span>
      ))}
      <span>Um ponto por vaga — cheio = ocupado, vazado = vaga, tracejado = bloqueado.</span>
    </div>
  )
}

function ModalNovoQuarto({ quartos, aoFechar }: { quartos: QuartoComOcupacao[]; aoFechar: () => void }) {
  const prototipo = usePrototipo()
  const idForm = useId()
  const [numero, setNumero] = useState('')
  const [andar, setAndar] = useState('')
  const [capacidade, setCapacidade] = useState('1')
  const [tipo, setTipo] = useState<TipoQuarto>('ENFERMARIA')
  const [tentou, setTentou] = useState(false)

  const duplicado = quartos.some((q) => q.numero === numero.trim())
  const erros = {
    numero: !numero.trim() ? 'Informe o número do quarto.' : duplicado ? 'Já existe um quarto com este número.' : undefined,
    andar: andar === '' || !Number.isInteger(Number(andar)) ? 'Informe o andar.' : undefined,
    capacidade: !Number.isInteger(Number(capacidade)) || Number(capacidade) <= 0 ? 'A capacidade máxima deve ser maior que zero.' : undefined,
  }
  const mostrar = (c: keyof typeof erros) => (tentou || (c === 'numero' && duplicado) ? erros[c] : undefined)

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    if (Object.values(erros).some(Boolean)) return
    prototipo('Quarto cadastrado')
    aoFechar()
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Novo quarto"
      descricao="A situação não é informada: o quarto nasce disponível e passa a ser calculada pela ocupação."
      rodape={
        <>
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form={idForm} variante="primario" icone={<Plus />}>
            Cadastrar quarto
          </Botao>
        </>
      }
    >
      <form id={idForm} onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Número" obrigatorio erro={mostrar('numero')} ajuda="Único no hospital.">
          {(p) => <Entrada {...p} mono value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex.: 207" required />}
        </Campo>
        <Campo rotulo="Andar" obrigatorio erro={mostrar('andar')}>
          {(p) => <Entrada {...p} type="number" inputMode="numeric" mono value={andar} onChange={(e) => setAndar(e.target.value)} required />}
        </Campo>
        <Campo rotulo="Capacidade máxima" obrigatorio erro={mostrar('capacidade')} ajuda="Pacientes ao mesmo tempo (RN5).">
          {(p) => <Entrada {...p} type="number" inputMode="numeric" min={1} mono value={capacidade} onChange={(e) => setCapacidade(e.target.value)} required />}
        </Campo>
        <Campo rotulo="Tipo" obrigatorio>
          {(p) => (
            <Selecao {...p} value={tipo} onChange={(e) => setTipo(e.target.value as TipoQuarto)}>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {tiposQuarto[t].rotulo}
                </option>
              ))}
            </Selecao>
          )}
        </Campo>
      </form>
    </Modal>
  )
}
