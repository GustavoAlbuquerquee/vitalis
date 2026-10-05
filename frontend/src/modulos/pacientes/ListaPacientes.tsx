import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, UserPlus, Users } from 'lucide-react'
import { BotaoIcone, BotaoLink, Busca, Cartao, CabecalhoPagina, EstadoVazio, Linha, Pagina, Pilulas, Selo, Tabela, Td, Th } from '@/ds'
import { Pessoa } from '@/componentes/dominio'
import { buscarQuarto, internacaoAtivaDoPaciente, listarConsultas, listarPacientes } from '@/api'
import { hoje, idade } from '@/lib/datas'
import { formatarCpf, formatarData, formatarTelefone, plural } from '@/lib/formato'

type Filtro = 'todos' | 'internados' | 'inativos'
const POR_PAGINA = 12

export function ListaPacientes() {
  const [params, setParams] = useSearchParams()
  const busca = params.get('busca') ?? ''
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [pagina, setPagina] = useState(0)

  const todos = useMemo(() => listarPacientes(busca), [busca])
  const linhas = useMemo(
    () =>
      todos.map((p) => {
        const internacao = internacaoAtivaDoPaciente(p.id)
        const ultima = listarConsultas({ pacienteId: p.id })
          .filter((c) => c.status === 'REALIZADA' && c.data <= hoje())
          .at(-1)
        return { p, internacao, quarto: internacao && buscarQuarto(internacao.quartoId), ultima }
      }),
    [todos],
  )

  const contagem = {
    todos: linhas.filter((l) => l.p.ativo).length,
    internados: linhas.filter((l) => l.internacao).length,
    inativos: linhas.filter((l) => !l.p.ativo).length,
  }
  const filtradas = linhas.filter((l) => (filtro === 'internados' ? l.internacao : filtro === 'inativos' ? !l.p.ativo : l.p.ativo))
  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const atual = Math.min(pagina, paginas - 1)
  const visiveis = filtradas.slice(atual * POR_PAGINA, (atual + 1) * POR_PAGINA)

  const mudarBusca = (v: string) => {
    setPagina(0)
    setParams(v ? { busca: v } : {}, { replace: true })
  }

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Pacientes"
        descricao={`${plural(contagem.todos, 'paciente ativo', 'pacientes ativos')} no cadastro`}
        acoes={
          <BotaoLink to="/pacientes/novo" variante="primario" icone={<UserPlus />}>
            Novo paciente
          </BotaoLink>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Busca valor={busca} aoMudar={mudarBusca} placeholder="Nome ou CPF" className="md:w-80" aria-label="Buscar paciente por nome ou CPF" />
        <Pilulas
          rotulo="Filtrar pacientes"
          valor={filtro}
          aoMudar={(f) => (setFiltro(f), setPagina(0))}
          opcoes={[
            { valor: 'todos', rotulo: 'Ativos', contagem: contagem.todos },
            { valor: 'internados', rotulo: 'Internados', contagem: contagem.internados },
            { valor: 'inativos', rotulo: 'Desativados', contagem: contagem.inativos },
          ]}
        />
      </div>

      <Cartao className="overflow-hidden">
        {visiveis.length === 0 ? (
          <EstadoVazio
            icone={<Users />}
            titulo={busca ? `Nenhum paciente encontrado para “${busca}”` : 'Nenhum paciente neste filtro'}
            descricao="Confira a grafia ou busque pelos dígitos do CPF."
            acao={
              <BotaoLink to="/pacientes/novo" icone={<UserPlus />}>
                Cadastrar paciente
              </BotaoLink>
            }
          />
        ) : (
          <Tabela>
            <thead>
              <tr>
                <Th>Paciente</Th>
                <Th>CPF</Th>
                <Th className="text-right">Idade</Th>
                <Th>Telefone</Th>
                <Th>Cidade</Th>
                <Th>Situação</Th>
                <Th>Última consulta</Th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(({ p, internacao, quarto, ultima }) => (
                <Linha key={p.id} para={`/pacientes/${p.id}`}>
                  <Td className="min-w-[240px]">
                    <Pessoa nome={p.nome} detalhe={p.email} para={`/pacientes/${p.id}`} />
                  </Td>
                  <Td className="font-mono text-sm whitespace-nowrap text-ink-2 tabular">{formatarCpf(p.cpf)}</Td>
                  <Td className="text-right text-ink-2 tabular">{idade(p.dataNascimento)}</Td>
                  <Td className="whitespace-nowrap text-ink-2 tabular">{formatarTelefone(p.telefone)}</Td>
                  <Td className="whitespace-nowrap text-ink-2">
                    {p.endereco.cidade}
                    <span className="text-ink-3"> · {p.endereco.uf}</span>
                  </Td>
                  <Td>
                    {!p.ativo ? (
                      <Selo tom="neutral">Desativado</Selo>
                    ) : internacao ? (
                      <Selo tom="brand">Internado · {quarto?.numero}</Selo>
                    ) : (
                      <span className="text-sm text-ink-3">Ambulatorial</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-ink-2 tabular">{ultima ? formatarData(ultima.data) : <span className="text-ink-3">—</span>}</Td>
                </Linha>
              ))}
            </tbody>
          </Tabela>
        )}
        {filtradas.length > POR_PAGINA && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-sm text-ink-3">
            <span className="tabular">
              {atual * POR_PAGINA + 1}–{Math.min((atual + 1) * POR_PAGINA, filtradas.length)} de {filtradas.length}
            </span>
            <div className="flex items-center gap-1">
              <BotaoIcone rotulo="Página anterior" tamanho="sm" disabled={atual === 0} onClick={() => setPagina(atual - 1)}>
                <ChevronLeft />
              </BotaoIcone>
              <span className="px-1 tabular">
                {atual + 1} / {paginas}
              </span>
              <BotaoIcone rotulo="Próxima página" tamanho="sm" disabled={atual >= paginas - 1} onClick={() => setPagina(atual + 1)}>
                <ChevronRight />
              </BotaoIcone>
            </div>
          </div>
        )}
      </Cartao>
    </Pagina>
  )
}
