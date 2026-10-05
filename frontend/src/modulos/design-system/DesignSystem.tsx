import { useState, type ReactNode } from 'react'
import { BedDouble, CalendarPlus, Plus, Search, Trash2, Users } from 'lucide-react'
import {
  Abas,
  Alerta,
  AreaTexto,
  Avatar,
  BarraProgresso,
  Botao,
  BotaoIcone,
  Busca,
  CabecalhoCartao,
  CabecalhoPagina,
  Campo,
  Cartao,
  CorpoCartao,
  Entrada,
  Etiqueta,
  EstadoVazio,
  ListaDefinicao,
  Metrica,
  Modal,
  Pagina,
  Pilulas,
  PontosOcupacao,
  Segmentado,
  Selecao,
  Selo,
  Tabela,
  Td,
  Th,
  useAviso,
} from '@/ds'
import { Pessoa } from '@/componentes/dominio'
import { MarcaVitalis } from '@/app/Logo'
import { situacaoQuarto, statusConsulta, statusInternacao, tiposRegistro, type Tom } from '@/lib/rotulos'

const cores: { grupo: string; descricao: string; tokens: { nome: string; uso: string }[] }[] = [
  {
    grupo: 'Superfícies',
    descricao: 'Papel quente: o prontuário que o sistema substitui. Profundidade vem de borda, não de sombra.',
    tokens: [
      { nome: 'bg', uso: 'Fundo da aplicação' },
      { nome: 'surface', uso: 'Cartões, tabelas, modais' },
      { nome: 'surface-2', uso: 'Menu lateral, cabeçalhos de tabela, campos desabilitados' },
      { nome: 'surface-3', uso: 'Trilhos de progresso, hover forte' },
      { nome: 'line', uso: 'Bordas e divisórias' },
      { nome: 'line-strong', uso: 'Bordas de controles' },
    ],
  },
  {
    grupo: 'Tinta',
    descricao: 'Três níveis de texto. Nunca mais que isso numa mesma área.',
    tokens: [
      { nome: 'ink', uso: 'Texto principal, títulos' },
      { nome: 'ink-2', uso: 'Texto secundário, valores em tabela' },
      { nome: 'ink-3', uso: 'Rótulos, metadados, placeholders' },
    ],
  },
  {
    grupo: 'Marca',
    descricao: 'Verde-petróleo, a cor vital. Reservada para ação principal, seleção e internação ativa.',
    tokens: [
      { nome: 'brand', uso: 'Botão primário, item ativo, foco' },
      { nome: 'brand-hover', uso: 'Hover do primário' },
      { nome: 'brand-soft', uso: 'Fundo de seleção' },
      { nome: 'brand-ink', uso: 'Texto sobre brand-soft' },
    ],
  },
]

const semanticas: { tom: Tom; nome: string; uso: string }[] = [
  { tom: 'ok', nome: 'ok', uso: 'Realizada, alta, disponível' },
  { tom: 'info', nome: 'info', uso: 'Agendada, informação' },
  { tom: 'warn', nome: 'warn', uso: 'Manutenção, alta hoje, atenção' },
  { tom: 'danger', nome: 'danger', uso: 'Cancelada, lotado, conflito' },
  { tom: 'neutral', nome: 'neutral', uso: 'Não compareceu, transferida, interditado' },
  { tom: 'brand', nome: 'brand', uso: 'Internação ativa' },
]

const escala = [
  { classe: 'text-2xl', px: '32/40', uso: 'Título de página (desktop)', peso: 'font-semibold tracking-[-0.02em]' },
  { classe: 'text-xl', px: '24/32', uso: 'Título de página (mobile), números de métrica', peso: 'font-semibold tracking-[-0.015em]' },
  { classe: 'text-lg', px: '20/28', uso: 'Destaques', peso: 'font-semibold' },
  { classe: 'text-md', px: '16/24', uso: 'Título de modal', peso: 'font-semibold' },
  { classe: 'text-base', px: '14/22', uso: 'Texto padrão, títulos de cartão', peso: '' },
  { classe: 'text-sm', px: '13/20', uso: 'Texto de apoio, botões pequenos', peso: '' },
  { classe: 'text-xs', px: '12/16', uso: 'Rótulos, selos, ajuda de campo', peso: '' },
  { classe: 'text-2xs', px: '11/16', uso: 'Sobretítulos em caixa-alta', peso: 'font-semibold uppercase tracking-[0.06em]' },
]

function Secao({ id, titulo, descricao, children }: { id: string; titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-10 first:border-0 first:pt-0">
      <h2 className="text-lg font-semibold tracking-[-0.01em]">{titulo}</h2>
      {descricao && <p className="mt-1 max-w-2xl text-base text-ink-2">{descricao}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Exemplo({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <p className="mb-2 text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">{titulo}</p>
      <div className={className ?? 'flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface p-5'}>{children}</div>
    </div>
  )
}

const indice = [
  ['principios', 'Princípios'],
  ['cores', 'Cores'],
  ['tipografia', 'Tipografia'],
  ['forma', 'Forma e espaço'],
  ['botoes', 'Botões'],
  ['status', 'Status'],
  ['formularios', 'Formulários'],
  ['navegacao', 'Navegação'],
  ['feedback', 'Feedback'],
  ['dados', 'Dados'],
]

export function DesignSystem() {
  const avisar = useAviso()
  const [modal, setModal] = useState(false)
  const [aba, setAba] = useState('geral')
  const [seg, setSeg] = useState('dia')
  const [pil, setPil] = useState('todas')
  const [busca, setBusca] = useState('')

  return (
    <Pagina>
      <CabecalhoPagina
        antes={<MarcaVitalis className="size-12" />}
        titulo="Design system"
        descricao="Os tokens e componentes que montam o Vitalis. Tudo aqui é o código real — mude o tema no topo para ver as duas versões."
      />

      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Seções do design system" className="hidden lg:block">
          <ul className="sticky top-24 flex flex-col gap-0.5 text-sm">
            {indice.map(([id, rotulo]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded px-2 py-1 text-ink-3 hover:bg-surface-2 hover:text-ink">
                  {rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Secao id="principios" titulo="Princípios">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Do papel ao pulso', 'Fundo em tom de papel, tinta escura, um único verde vital. O sistema lembra o prontuário que substitui — só que organizado.'],
                ['A regra aparece antes do erro', 'Conflito de horário, capacidade do quarto, paciente já internado: a interface avisa enquanto a pessoa preenche, não depois do envio.'],
                ['Dado clínico é preciso', 'CPF, registro, horários e números de quarto usam fonte mono com algarismos tabulares. Nada "dança" numa coluna.'],
              ].map(([t, d]) => (
                <Cartao key={t} className="p-5">
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1.5 text-sm text-ink-2">{d}</p>
                </Cartao>
              ))}
            </div>
          </Secao>

          <Secao id="cores" titulo="Cores" descricao="Componentes nunca usam hex: usam as utilidades geradas dos tokens (bg-surface, text-ink-2, border-line). O tema escuro só redefine as variáveis.">
            <div className="flex flex-col gap-8">
              {cores.map((g) => (
                <div key={g.grupo}>
                  <p className="font-semibold">{g.grupo}</p>
                  <p className="mb-3 text-sm text-ink-3">{g.descricao}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    {g.tokens.map((t) => (
                      <div key={t.nome} className="overflow-hidden rounded-card border border-line bg-surface">
                        <div className="h-16 border-b border-line" style={{ background: `var(--${t.nome})` }} />
                        <div className="p-2.5">
                          <p className="font-mono text-xs font-medium">{t.nome}</p>
                          <p className="mt-0.5 text-xs text-ink-3">{t.uso}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className="font-semibold">Semânticas</p>
                <p className="mb-3 text-sm text-ink-3">Cada uma em par: sólida para texto e ícone, suave para fundo. Cor nunca é a única pista — o texto sempre diz o estado.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {semanticas.map((s) => (
                    <div key={s.nome} className="overflow-hidden rounded-card border border-line bg-surface">
                      <div className="flex h-16">
                        <div className="flex-1" style={{ background: `var(--${s.nome})` }} />
                        <div className="flex flex-1 items-center justify-center" style={{ background: `var(--${s.nome}-soft)` }}>
                          <span className="text-sm font-semibold" style={{ color: `var(--${s.nome === 'brand' ? 'brand-ink' : s.nome})` }}>
                            Aa
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="font-mono text-xs font-medium">
                          {s.nome} · {s.nome}-soft
                        </p>
                        <p className="mt-0.5 text-xs text-ink-3">{s.uso}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Secao>

          <Secao id="tipografia" titulo="Tipografia" descricao="Geist para a interface, Geist Mono para dados. Base de 14px — o Vitalis é ferramenta de operação, densa por necessidade.">
            <Cartao className="divide-y divide-line">
              {escala.map((e) => (
                <div key={e.classe} className="grid items-baseline gap-2 px-5 py-3.5 sm:grid-cols-[120px_1fr_220px]">
                  <span className="font-mono text-xs text-ink-3">
                    {e.classe} · {e.px}
                  </span>
                  <span className={`${e.classe} ${e.peso} truncate`}>Internação do quarto 302</span>
                  <span className="text-sm text-ink-3">{e.uso}</span>
                </div>
              ))}
              <div className="grid items-baseline gap-2 px-5 py-3.5 sm:grid-cols-[120px_1fr_220px]">
                <span className="font-mono text-xs text-ink-3">font-mono</span>
                <span className="font-mono text-sm tabular">123.456.789-09 · CRM-MG 48.213 · 09:30 – 10:00</span>
                <span className="text-sm text-ink-3">CPF, registro, horário, nº do quarto</span>
              </div>
            </Cartao>
          </Secao>

          <Secao id="forma" titulo="Forma e espaço" descricao="Grade de 4px. Dois raios: 7px para controles, 12px para contêineres. Sombra só no que flutua (menus, modais, avisos).">
            <div className="grid gap-4 sm:grid-cols-3">
              <Exemplo titulo="rounded-control · 7px">
                <div className="h-12 w-full rounded-control border-2 border-brand bg-brand-soft" />
              </Exemplo>
              <Exemplo titulo="rounded-card · 12px">
                <div className="h-12 w-full rounded-card border-2 border-brand bg-brand-soft" />
              </Exemplo>
              <Exemplo titulo="shadow-pop · shadow-modal">
                <div className="h-12 flex-1 rounded-card bg-surface shadow-pop" />
                <div className="h-12 flex-1 rounded-card bg-surface shadow-modal" />
              </Exemplo>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5">
                  <div className="rounded-sm bg-brand/70" style={{ width: n * 4, height: n * 4 }} />
                  <span className="font-mono text-2xs text-ink-3">{n * 4}</span>
                </div>
              ))}
            </div>
          </Secao>

          <Secao id="botoes" titulo="Botões" descricao="Um primário por tela. Perigo só para ação destrutiva confirmada em modal.">
            <div className="flex flex-col gap-4">
              <Exemplo titulo="Variantes">
                <Botao variante="primario" icone={<CalendarPlus />}>
                  Agendar consulta
                </Botao>
                <Botao icone={<BedDouble />}>Nova internação</Botao>
                <Botao variante="fantasma">Cancelar</Botao>
                <Botao variante="perigo" icone={<Trash2 />}>
                  Desativar
                </Botao>
              </Exemplo>
              <Exemplo titulo="Tamanhos e estados">
                <Botao variante="primario" tamanho="sm">
                  Pequeno
                </Botao>
                <Botao tamanho="sm">Pequeno</Botao>
                <Botao variante="primario" carregando>
                  Salvando
                </Botao>
                <Botao disabled>Desabilitado</Botao>
                <BotaoIcone rotulo="Adicionar">
                  <Plus />
                </BotaoIcone>
                <BotaoIcone rotulo="Buscar" tamanho="sm">
                  <Search />
                </BotaoIcone>
              </Exemplo>
            </div>
          </Secao>

          <Secao id="status" titulo="Status" descricao="Todo enum do domínio tem rótulo e tom fixos, definidos em src/lib/rotulos.ts. O mesmo status tem a mesma cor em qualquer tela.">
            <div className="grid gap-4 md:grid-cols-2">
              <Exemplo titulo="StatusConsulta">
                {Object.values(statusConsulta).map((s) => (
                  <Selo key={s.rotulo} tom={s.tom}>
                    {s.rotulo}
                  </Selo>
                ))}
              </Exemplo>
              <Exemplo titulo="StatusInternacao">
                {Object.values(statusInternacao).map((s) => (
                  <Selo key={s.rotulo} tom={s.tom}>
                    {s.rotulo}
                  </Selo>
                ))}
              </Exemplo>
              <Exemplo titulo="SituacaoQuarto">
                {Object.values(situacaoQuarto).map((s) => (
                  <Selo key={s.rotulo} tom={s.tom}>
                    {s.rotulo}
                  </Selo>
                ))}
              </Exemplo>
              <Exemplo titulo="TipoRegistro · etiquetas">
                {Object.values(tiposRegistro).map((s) => (
                  <Selo key={s.rotulo} tom={s.tom} ponto={false}>
                    {s.rotulo}
                  </Selo>
                ))}
                <Etiqueta>UTI</Etiqueta>
                <Etiqueta>Cardiologia</Etiqueta>
              </Exemplo>
            </div>
          </Secao>

          <Secao id="formularios" titulo="Formulários" descricao="Campo liga rótulo, ajuda e erro ao controle (aria-describedby, aria-invalid). Erros aparecem após a primeira tentativa de envio.">
            <Cartao className="grid gap-5 p-5 sm:grid-cols-2">
              <Campo rotulo="Nome completo" obrigatorio ajuda="Como consta no documento.">
                {(p) => <Entrada {...p} placeholder="Ana Clara Ribeiro" />}
              </Campo>
              <Campo rotulo="CPF" obrigatorio erro="CPF inválido — confira os dígitos.">
                {(p) => <Entrada {...p} mono defaultValue="123.456.789-00" />}
              </Campo>
              <Campo rotulo="Especialidade">
                {(p) => (
                  <Selecao {...p}>
                    <option>Cardiologia</option>
                    <option>Pediatria</option>
                  </Selecao>
                )}
              </Campo>
              <Campo rotulo="Desabilitado">{(p) => <Entrada {...p} disabled value="Derivado — não editável" readOnly />}</Campo>
              <Campo rotulo="Observações" className="sm:col-span-2">
                {(p) => <AreaTexto {...p} placeholder="Queixa, exame físico, conduta…" />}
              </Campo>
              <Busca valor={busca} aoMudar={setBusca} placeholder="Nome ou CPF" aria-label="Exemplo de busca" />
            </Cartao>
          </Secao>

          <Secao id="navegacao" titulo="Navegação" descricao="Abas trocam a seção da página; segmentado troca o modo de ver os mesmos dados; pílulas filtram.">
            <div className="flex flex-col gap-4">
              <Exemplo titulo="Abas" className="rounded-card border border-line bg-surface px-5 pt-2">
                <Abas
                  rotulo="Exemplo de abas"
                  valor={aba}
                  aoMudar={setAba}
                  className="w-full border-0"
                  opcoes={[
                    { valor: 'geral', rotulo: 'Visão geral' },
                    { valor: 'historico', rotulo: 'Histórico médico', contagem: 14 },
                  ]}
                />
              </Exemplo>
              <div className="grid gap-4 md:grid-cols-2">
                <Exemplo titulo="Segmentado">
                  <Segmentado
                    rotulo="Exemplo segmentado"
                    valor={seg}
                    aoMudar={setSeg}
                    opcoes={[
                      { valor: 'dia', rotulo: 'Grade' },
                      { valor: 'lista', rotulo: 'Lista' },
                    ]}
                  />
                </Exemplo>
                <Exemplo titulo="Pílulas">
                  <Pilulas
                    rotulo="Exemplo pílulas"
                    valor={pil}
                    aoMudar={setPil}
                    opcoes={[
                      { valor: 'todas', rotulo: 'Todas', contagem: 32 },
                      { valor: 'agendada', rotulo: 'Agendadas', contagem: 18 },
                      { valor: 'realizada', rotulo: 'Realizadas', contagem: 11 },
                    ]}
                  />
                </Exemplo>
              </div>
            </div>
          </Secao>

          <Secao id="feedback" titulo="Feedback" descricao="Alerta fica preso ao contexto (regras de negócio). Aviso (toast) confirma uma ação. Modal pede confirmação do que muda estado.">
            <div className="grid gap-3 md:grid-cols-2">
              <Alerta tom="danger" titulo="Conflito de horário (RN3)">
                Já existe consulta das 09:30 com Bruno Henrique Santos.
              </Alerta>
              <Alerta tom="warn" titulo="Fora da disponibilidade">
                Dra. Helena Duarte atende 08:00–12:00 às segundas.
              </Alerta>
              <Alerta tom="info" titulo="O histórico é derivado">
                Montado a partir das consultas e internações já gravadas.
              </Alerta>
              <Alerta tom="ok" titulo="Horário livre" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Botao onClick={() => avisar({ titulo: 'Consulta agendada', descricao: 'Sexta, 9 de outubro às 09:30.' })}>Mostrar aviso</Botao>
              <Botao onClick={() => avisar({ titulo: 'Não foi possível salvar', descricao: 'O quarto 302 atingiu a capacidade máxima.', tom: 'danger' })}>Aviso de erro</Botao>
              <Botao onClick={() => setModal(true)}>Abrir modal</Botao>
            </div>
            <Modal
              aberto={modal}
              aoFechar={() => setModal(false)}
              titulo="Cancelar consulta?"
              descricao="A consulta não é apagada: muda para Cancelada e continua no histórico."
              largura="sm"
              rodape={
                <>
                  <Botao variante="fantasma" onClick={() => setModal(false)}>
                    Voltar
                  </Botao>
                  <Botao variante="perigo" onClick={() => setModal(false)}>
                    Cancelar consulta
                  </Botao>
                </>
              }
            />
          </Secao>

          <Secao id="dados" titulo="Dados" descricao="Métricas, ocupação, pessoas, tabelas e estados vazios.">
            <div className="grid gap-4 md:grid-cols-3">
              <Metrica rotulo="Ocupação" valor="78%" detalhe="39 de 50 vagas">
                <BarraProgresso valor={39} total={50} />
              </Metrica>
              <Metrica rotulo="Internações ativas" valor="21" detalhe="3 altas previstas hoje" />
              <Cartao>
                <CabecalhoCartao titulo="Ocupação do quarto" descricao="Um ponto por vaga — RN5 visível" />
                <CorpoCartao className="flex flex-col gap-3 text-sm">
                  <span className="flex items-center justify-between">
                    Disponível <PontosOcupacao ocupacao={2} capacidade={4} situacao="DISPONIVEL" />
                  </span>
                  <span className="flex items-center justify-between">
                    Lotado <PontosOcupacao ocupacao={2} capacidade={2} situacao="OCUPADO" />
                  </span>
                  <span className="flex items-center justify-between">
                    Manutenção <PontosOcupacao ocupacao={0} capacidade={3} situacao="MANUTENCAO" />
                  </span>
                </CorpoCartao>
              </Cartao>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Cartao className="overflow-hidden">
                <Tabela>
                  <thead>
                    <tr>
                      <Th>Paciente</Th>
                      <Th>CPF</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <Td>
                        <Pessoa nome="Ana Clara Ribeiro" detalhe="34 anos" tamanho="sm" />
                      </Td>
                      <Td className="font-mono text-sm whitespace-nowrap tabular">123.456.789-09</Td>
                      <Td>
                        <Selo tom="brand">Internado · 202</Selo>
                      </Td>
                    </tr>
                    <tr>
                      <Td>
                        <Pessoa nome="Bruno Henrique Santos" detalhe="51 anos" tamanho="sm" />
                      </Td>
                      <Td className="font-mono text-sm whitespace-nowrap tabular">987.654.321-00</Td>
                      <Td>
                        <span className="text-sm text-ink-3">Ambulatorial</span>
                      </Td>
                    </tr>
                  </tbody>
                </Tabela>
              </Cartao>
              <Cartao>
                <EstadoVazio icone={<Users />} titulo="Nenhum paciente encontrado" descricao="Estados vazios dizem o que aconteceu e o próximo passo." className="py-8" />
              </Cartao>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Cartao className="p-5">
                <ListaDefinicao
                  itens={[
                    { rotulo: 'CPF', valor: '123.456.789-09', mono: true },
                    { rotulo: 'Telefone', valor: '(31) 98765-4321' },
                    { rotulo: 'Nascimento', valor: '14 de março de 1990' },
                    { rotulo: 'Complemento', valor: null },
                  ]}
                />
              </Cartao>
              <Cartao className="flex items-center gap-3 p-5">
                {['Helena Duarte', 'Rafael Moreira', 'Camila Teixeira', 'Juliana Rocha', 'Lucas Amaral'].map((n, i) => (
                  <Avatar key={n} nome={n} tamanho={(['sm', 'md', 'lg', 'xl', 'md'] as const)[i]} />
                ))}
              </Cartao>
            </div>
          </Secao>
        </div>
      </div>
    </Pagina>
  )
}
