import { useState } from 'react'
import { Link } from 'react-router'
import { LayoutGrid, List, SearchX, UserPlus } from 'lucide-react'
import { Botao, BotaoLink, Busca, CabecalhoPagina, Cartao, EstadoVazio, Etiqueta, Linha, Pagina, Pilulas, Segmentado, Selo, Tabela, Td, Th, Avatar } from '@/ds'
import { Pessoa, nomeEspecialidade } from '@/componentes/dominio'
import { listarConsultas, listarProfissionais } from '@/api'
import { hoje, indiceDiaSemana, minutos } from '@/lib/datas'
import { formatarTelefone, normalizar, plural } from '@/lib/formato'
import { diasSemana, especialidades, type Tom } from '@/lib/rotulos'
import type { Especialidade, ProfissionalSaude } from '@/tipos/dominio'
import { cn } from '@/lib/cn'
import s from './ListaProfissionais.module.css'

type Filtro = Especialidade | 'TODAS'
type Visao = 'grade' | 'tabela'

/** Situação de hoje a partir das janelas de disponibilidade do dia da semana. */
function situacaoHoje(p: ProfissionalSaude, agora: number): { rotulo: string; tom: Tom } {
  const dia = diasSemana[indiceDiaSemana(hoje())].valor
  const janelas = p.disponibilidades.filter((j) => j.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  if (!janelas.length) return { rotulo: 'Não atende hoje', tom: 'neutral' }
  const atual = janelas.find((j) => minutos(j.horaInicio) <= agora && agora < minutos(j.horaFim))
  if (atual) return { rotulo: `Atendendo agora até ${atual.horaFim}`, tom: 'ok' }
  const proxima = janelas.find((j) => minutos(j.horaInicio) > agora)
  if (proxima) return { rotulo: `Atende hoje das ${proxima.horaInicio}`, tom: 'info' }
  return { rotulo: `Encerrou às ${janelas[janelas.length - 1].horaFim}`, tom: 'neutral' }
}

function consultasHoje(p: ProfissionalSaude) {
  const lista = listarConsultas({ profissionalId: p.id, data: hoje() }).filter((c) => c.status !== 'CANCELADA')
  return { total: lista.length, aSeguir: lista.filter((c) => c.status === 'AGENDADA').length }
}

/** Sete chips Seg…Dom; os dias com janela de disponibilidade ficam destacados. */
function DiasAtendimento({ p }: { p: ProfissionalSaude }) {
  const indiceHoje = indiceDiaSemana(hoje())
  const atende = diasSemana.filter((d) => p.disponibilidades.some((j) => j.diaSemana === d.valor))
  return (
    <div role="img" aria-label={atende.length ? `Atende: ${atende.map((d) => d.rotulo).join(', ')}` : 'Sem disponibilidade cadastrada'} className={s.dias}>
      {diasSemana.map((d, i) => {
        const ativo = atende.includes(d)
        return (
          <span
            key={d.valor}
            aria-hidden
            className={cn(s.dia, ativo && s.diaAtivo, i === indiceHoje && s.diaHoje)}
          >
            {d.curto}
          </span>
        )
      })}
    </div>
  )
}

export function ListaProfissionais() {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [visao, setVisao] = useState<Visao>('grade')

  const agora = new Date().getHours() * 60 + new Date().getMinutes()
  const todos = listarProfissionais()
  const atendendoAgora = todos.filter((p) => situacaoHoje(p, agora).tom === 'ok').length

  const q = normalizar(busca.trim())
  const digitos = busca.replace(/\D/g, '')
  const encontrados = todos.filter(
    (p) =>
      !q ||
      normalizar(p.nome).includes(q) ||
      normalizar(p.registroProfissional).includes(q) ||
      (digitos.length >= 2 && p.registroProfissional.replace(/\D/g, '').includes(digitos)),
  )
  const visiveis = encontrados.filter((p) => filtro === 'TODAS' || p.especialidade === filtro)

  // Só as especialidades que existem no cadastro, na ordem do enum
  const presentes = (Object.keys(especialidades) as Especialidade[]).filter((e) => todos.some((p) => p.especialidade === e))
  const opcoesFiltro = [
    { valor: 'TODAS' as Filtro, rotulo: 'Todas', contagem: encontrados.length },
    ...presentes.map((e) => ({ valor: e as Filtro, rotulo: especialidades[e].rotulo, contagem: encontrados.filter((p) => p.especialidade === e).length })),
  ]

  const limpar = () => {
    setBusca('')
    setFiltro('TODAS')
  }

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Profissionais"
        descricao={`${plural(todos.length, 'profissional da saúde', 'profissionais da saúde')} cadastrados · ${atendendoAgora} atendendo agora`}
        acoes={
          <BotaoLink to="/profissionais/novo" variante="primario" icone={<UserPlus />}>
            Novo profissional
          </BotaoLink>
        }
      />

      <div className={s.filtros}>
        <div className={s.barra}>
          <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou registro…" aria-label="Buscar profissional" className={s.busca} />
          <Segmentado
            rotulo="Modo de visualização"
            valor={visao}
            aoMudar={setVisao}
            className={s.visao}
            opcoes={[
              { valor: 'grade', rotulo: <><LayoutGrid aria-hidden /><span className={s.rotuloVisao}>Grade</span></> },
              { valor: 'tabela', rotulo: <><List aria-hidden /><span className={s.rotuloVisao}>Tabela</span></> },
            ]}
          />
        </div>
        <Pilulas rotulo="Filtrar por especialidade" valor={filtro} aoMudar={setFiltro} opcoes={opcoesFiltro} />
      </div>

      {visiveis.length === 0 ? (
        <Cartao>
          <EstadoVazio
            icone={<SearchX />}
            titulo="Nenhum profissional encontrado"
            descricao="Nenhum cadastro corresponde à busca e ao filtro escolhidos. Confira a grafia ou o número do registro."
            acao={<Botao onClick={limpar}>Limpar filtros</Botao>}
          />
        </Cartao>
      ) : visao === 'grade' ? (
        <ul className={s.grade}>
          {visiveis.map((p) => {
            const sit = situacaoHoje(p, agora)
            const n = consultasHoje(p)
            return (
              <li key={p.id} className={s.item}>
                <Link to={`/profissionais/${p.id}`} className={s.cartao}>
                  <div className={s.topo}>
                    <Avatar nome={p.nome} tamanho="lg" />
                    <div className={s.identificacao}>
                      <p className={s.nome}>{p.nome}</p>
                      <p className={s.especialidade}>{nomeEspecialidade(p)}</p>
                      <p className={cn(s.registro, 'tabular')}>{p.registroProfissional}</p>
                    </div>
                  </div>
                  <div className={s.semana}>
                    <DiasAtendimento p={p} />
                  </div>
                  <div className={s.rodape}>
                    <Selo tom={sit.tom}>{sit.rotulo}</Selo>
                    <span className={cn(s.consultas, 'tabular')}>
                      {n.total ? `${plural(n.total, 'consulta')} hoje` : 'Sem consultas hoje'}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Cartao>
          <Tabela>
            <thead>
              <tr>
                <Th>Profissional</Th>
                <Th>Especialidade</Th>
                <Th>Registro</Th>
                <Th>Contato</Th>
                <Th>Hoje</Th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => {
                const sit = situacaoHoje(p, agora)
                const n = consultasHoje(p)
                return (
                  <Linha key={p.id} para={`/profissionais/${p.id}`}>
                    <Td className={s.colunaPessoa}>
                      <Pessoa nome={p.nome} para={`/profissionais/${p.id}`} />
                    </Td>
                    <Td>
                      <Etiqueta>{nomeEspecialidade(p)}</Etiqueta>
                    </Td>
                    <Td className={cn(s.registroCelula, 'tabular')}>{p.registroProfissional}</Td>
                    <Td className={s.contato}>
                      <p className={cn(s.telefone, 'tabular')}>{formatarTelefone(p.telefone)}</p>
                      <p className={s.email}>{p.email}</p>
                    </Td>
                    <Td>
                      <div className={s.hoje}>
                        <Selo tom={sit.tom}>{sit.rotulo}</Selo>
                        {n.total > 0 && (
                          <span className={cn(s.hojeDetalhe, 'tabular')}>
                            {plural(n.total, 'consulta')} · {n.aSeguir} a seguir
                          </span>
                        )}
                      </div>
                    </Td>
                  </Linha>
                )
              })}
            </tbody>
          </Tabela>
        </Cartao>
      )}
    </Pagina>
  )
}
