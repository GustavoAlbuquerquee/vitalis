import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BedDouble, ChevronRight, Plus, SearchX } from 'lucide-react'
import { Abas, BotaoLink, Busca, Cartao, CabecalhoPagina, EstadoVazio, Etiqueta, Linha, Pagina, Tabela, Td, Th } from '@/ds'
import { Pessoa, SeloInternacao, diasInternado, nomeEspecialidade } from '@/componentes/dominio'
import { buscarPaciente, buscarProfissional, buscarQuarto, listarInternacoes } from '@/api'
import type { StatusInternacao } from '@/tipos/dominio'
import { idade } from '@/lib/datas'
import { formatarData, formatarDataHora, normalizar, plural } from '@/lib/formato'
import { statusInternacao, tiposQuarto } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import { AltaPrevista } from './utilidades'
import s from './ListaInternacoes.module.css'
import { CpfProtegido } from '@/componentes/CpfProtegido'

type Aba = StatusInternacao | 'TODAS'

const abas: Aba[] = ['ATIVA', 'ALTA_CONCEDIDA', 'TRANSFERIDA', 'CANCELADA', 'TODAS']
const rotulosAba: Record<Aba, string> = {
  ATIVA: 'Ativas',
  ALTA_CONCEDIDA: statusInternacao.ALTA_CONCEDIDA.rotulo,
  TRANSFERIDA: 'Transferidas',
  CANCELADA: 'Canceladas',
  TODAS: 'Todas',
}
const rotuloAba = (a: Aba) => rotulosAba[a]

const vazios: Record<Aba, string> = {
  ATIVA: 'Nenhum paciente internado agora',
  ALTA_CONCEDIDA: 'Nenhuma alta concedida',
  TRANSFERIDA: 'Nenhuma internação transferida',
  CANCELADA: 'Nenhuma internação cancelada',
  TODAS: 'Nenhuma internação registrada',
}

export function ListaInternacoes() {
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const aba: Aba = abas.includes(params.get('status') as Aba) ? (params.get('status') as Aba) : 'ATIVA'

  const todas = listarInternacoes()
  const contagem = (a: Aba) => (a === 'TODAS' ? todas.length : todas.filter((i) => i.status === a).length)
  const q = normalizar(busca.trim())
  const lista = todas
    .filter((i) => aba === 'TODAS' || i.status === aba)
    .filter((i) => !q || normalizar(buscarPaciente(i.pacienteId)?.nome ?? '').includes(q))
  const colunaAlta = aba === 'ATIVA' ? 'Alta prevista' : aba === 'TODAS' ? 'Alta' : 'Alta efetiva'

  const mudarAba = (a: Aba) =>
    setParams(
      (p) => {
        if (a === 'ATIVA') p.delete('status')
        else p.set('status', a)
        return p
      },
      { replace: true },
    )

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Internações"
        descricao="Permanências no hospital — da entrada à alta. Nada é apagado: encerradas seguem no histórico."
        acoes={
          <BotaoLink to="/internacoes/nova" variante="primario" icone={<Plus />}>
            Nova internação
          </BotaoLink>
        }
      />

      <div className={s.barra}>
        <Abas rotulo="Status da internação" valor={aba} aoMudar={mudarAba} opcoes={abas.map((a) => ({ valor: a, rotulo: rotuloAba(a), contagem: contagem(a) }))} className={s.abas} />
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar paciente…" aria-label="Buscar internação por nome do paciente" className={s.busca} />
      </div>

      <Cartao className={s.cartao}>
        {lista.length === 0 ? (
          q ? (
            <EstadoVazio icone={<SearchX />} titulo="Nenhum paciente encontrado" descricao={`Nenhuma internação nesta aba corresponde a “${busca.trim()}”.`} />
          ) : (
            <EstadoVazio
              icone={<BedDouble />}
              titulo={vazios[aba]}
              descricao={aba === 'ATIVA' ? 'Todos os quartos estão livres de internações ativas.' : undefined}
              acao={
                aba === 'ATIVA' && (
                  <BotaoLink to="/internacoes/nova" icone={<Plus />}>
                    Nova internação
                  </BotaoLink>
                )
              }
            />
          )
        ) : (
          <Tabela>
            <caption className="sr-only">
              {rotuloAba(aba)} — {plural(lista.length, 'internação', 'internações')}
            </caption>
            <thead>
              <tr>
                <Th scope="col">Paciente</Th>
                <Th scope="col">Quarto</Th>
                <Th scope="col">Responsável</Th>
                <Th scope="col">Entrada</Th>
                <Th scope="col">{colunaAlta}</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">
                  <span className="sr-only">Abrir</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {lista.map((i) => {
                const paciente = buscarPaciente(i.pacienteId)!
                const quarto = buscarQuarto(i.quartoId)!
                const prof = buscarProfissional(i.profissionalId)!
                const dias = diasInternado(i)
                return (
                  <Linha key={i.id} para={`/internacoes/${i.id}`}>
                    <Td className={s.colunaPaciente}>
                      <Pessoa
                        nome={paciente.nome}
                        para={`/pacientes/${paciente.id}`}
                        detalhe={
                          <>
                            {idade(paciente.dataNascimento)} anos · <CpfProtegido cpf={paciente.cpf} className={s.cpf} />
                          </>
                        }
                      />
                    </Td>
                    <Td>
                      <div className={s.quarto}>
                        <Link to={`/quartos/${quarto.id}`} className={cn(s.quartoNumero, 'tabular')} aria-label={`Quarto ${quarto.numero}`}>
                          {quarto.numero}
                        </Link>
                        <Etiqueta>{tiposQuarto[quarto.tipo].rotulo}</Etiqueta>
                      </div>
                    </Td>
                    <Td className={s.colunaResponsavel}>
                      <p className={s.responsavel}>{prof.nome}</p>
                      <p className={s.especialidade}>{nomeEspecialidade(prof)}</p>
                    </Td>
                    <Td className={s.semQuebra}>
                      <p className={cn(s.data, 'tabular')}>{formatarData(i.dataEntrada)}</p>
                      <p className={s.permanencia}>
                        {i.status === 'ATIVA' ? (dias === 0 ? 'entrou hoje' : `há ${plural(dias, 'dia')}`) : i.dataEfetivaAlta ? `${plural(dias, 'dia')} de permanência` : 'sem permanência'}
                      </p>
                    </Td>
                    <Td className={s.semQuebra}>
                      {i.status === 'ATIVA' ? (
                        <AltaPrevista data={i.dataPrevistaAlta} />
                      ) : i.dataEfetivaAlta ? (
                        <span className={cn(s.data, 'tabular')}>{formatarDataHora(i.dataEfetivaAlta)}</span>
                      ) : (
                        <span className={s.semData}>—</span>
                      )}
                    </Td>
                    <Td>
                      <SeloInternacao status={i.status} />
                    </Td>
                    <Td className={s.colunaAbrir}>
                      <Link
                        to={`/internacoes/${i.id}`}
                        aria-label={`Abrir internação de ${paciente.nome}`}
                        className={s.abrir}
                      >
                        <ChevronRight />
                      </Link>
                    </Td>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        )}
      </Cartao>
      {lista.length > 0 && (
        <p className={s.total}>
          {plural(lista.length, 'internação', 'internações')}
          {aba === 'TODAS' ? ' — ativas mostram a alta prevista; encerradas, a efetiva.' : '.'}
        </p>
      )}
    </Pagina>
  )
}
