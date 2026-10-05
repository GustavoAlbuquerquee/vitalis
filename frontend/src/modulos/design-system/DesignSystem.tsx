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
  BotaoSegurar,
  LeitosOcupacao,
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
import { Pulseira } from '@/componentes/Pulseira'
import { CpfProtegido } from '@/componentes/CpfProtegido'
import StatusMark from '@/ds/react-bits/StatusMark'
import { buscarPaciente } from '@/api'
import { MarcaVitalis } from '@/app/Logo'
import { situacaoQuarto, statusConsulta, statusInternacao, tiposRegistro, type Tom } from '@/lib/rotulos'
import { cn } from '@/lib/cn'
import s from './DesignSystem.module.css'

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
  { classe: 'text-2xl', px: '32/40', uso: 'Título de página (desktop)', estilo: s.texto2xl },
  { classe: 'text-xl', px: '24/32', uso: 'Título de página (mobile), números de métrica', estilo: s.textoXl },
  { classe: 'text-lg', px: '20/28', uso: 'Destaques', estilo: s.textoLg },
  { classe: 'text-md', px: '16/24', uso: 'Título de modal', estilo: s.textoMd },
  { classe: 'text-base', px: '14/22', uso: 'Texto padrão, títulos de cartão', estilo: s.textoBase },
  { classe: 'text-sm', px: '13/20', uso: 'Texto de apoio, botões pequenos', estilo: s.textoSm },
  { classe: 'text-xs', px: '12/16', uso: 'Rótulos, selos, ajuda de campo', estilo: s.textoXs },
  { classe: 'text-2xs', px: '11/16', uso: 'Sobretítulos em caixa-alta', estilo: s.texto2xs },
]

function Secao({ id, titulo, descricao, children }: { id: string; titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section id={id} className={s.secao}>
      <h2 className={s.secaoTitulo}>{titulo}</h2>
      {descricao && <p className={s.secaoDescricao}>{descricao}</p>}
      <div className={s.secaoCorpo}>{children}</div>
    </section>
  )
}

function Exemplo({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <p className={s.exemploTitulo}>{titulo}</p>
      <div className={className ?? s.exemplo}>{children}</div>
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
  ['assinatura', 'Elementos do Vitalis'],
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
        antes={<MarcaVitalis className={s.marca} />}
        titulo="Design system"
        descricao="Os tokens e componentes que montam o Vitalis. Tudo aqui é o código real — mude o tema no topo para ver as duas versões."
      />

      <div className={s.estrutura}>
        <nav aria-label="Seções do design system" className={s.indice}>
          <ul className={s.indiceLista}>
            {indice.map(([id, rotulo]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={s.indiceLink}
                  onClick={(e) => {
                    // Com rotas por hash, "#cores" viraria uma rota: rola até a seção direto
                    e.preventDefault()
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.conteudo}>
          <Secao id="principios" titulo="Princípios">
            <div className={s.grade3}>
              {[
                ['Do papel ao pulso', 'Fundo em tom de papel, tinta escura, um único verde vital. O sistema lembra o prontuário que substitui — só que organizado.'],
                ['A regra aparece antes do erro', 'Conflito de horário, capacidade do quarto, paciente já internado: a interface avisa enquanto a pessoa preenche, não depois do envio.'],
                ['Dado clínico é preciso', 'CPF, registro, horários e números de quarto usam fonte mono com algarismos tabulares. Nada "dança" numa coluna.'],
              ].map(([t, d]) => (
                <Cartao key={t} className={s.cartaoRespiro}>
                  <p className={s.forte}>{t}</p>
                  <p className={s.principioTexto}>{d}</p>
                </Cartao>
              ))}
            </div>
          </Secao>

          <Secao id="cores" titulo="Cores" descricao="Componentes nunca usam hex: o CSS de cada um lê as variáveis de src/estilos/tokens.css (var(--surface), var(--ink-2), var(--line)). O tema escuro só redefine as variáveis.">
            <div className={s.grupos}>
              {cores.map((g) => (
                <div key={g.grupo}>
                  <p className={s.forte}>{g.grupo}</p>
                  <p className={s.grupoDescricao}>{g.descricao}</p>
                  <div className={s.amostras}>
                    {g.tokens.map((t) => (
                      <div key={t.nome} className={s.amostra}>
                        <div className={s.amostraCor} style={{ background: `var(--${t.nome})` }} />
                        <div className={s.amostraLegenda}>
                          <p className={s.tokenNome}>{t.nome}</p>
                          <p className={s.tokenUso}>{t.uso}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className={s.forte}>Semânticas</p>
                <p className={s.grupoDescricao}>Cada uma em par: sólida para texto e ícone, suave para fundo. Cor nunca é a única pista — o texto sempre diz o estado.</p>
                <div className={s.amostras}>
                  {semanticas.map((sem) => (
                    <div key={sem.nome} data-tom={sem.tom} className={s.amostra}>
                      <div className={s.amostraPar}>
                        <div className={s.amostraSolida} />
                        <div className={s.amostraSuave}>
                          <span className={s.amostraTexto}>Aa</span>
                        </div>
                      </div>
                      <div className={s.amostraLegenda}>
                        <p className={s.tokenNome}>
                          {sem.nome} · {sem.nome}-soft
                        </p>
                        <p className={s.tokenUso}>{sem.uso}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Secao>

          <Secao id="tipografia" titulo="Tipografia" descricao="Schibsted Grotesk para a interface — uma grotesca de jornal, firme em tela densa. IBM Plex Mono para o dado clínico: CPF, registro, horário, número de quarto. Base de 14px.">
            <Cartao className={s.escala}>
              {escala.map((e) => (
                <div key={e.classe} className={s.escalaLinha}>
                  <span className={s.escalaNome}>
                    {e.classe} · {e.px}
                  </span>
                  <span className={cn(s.escalaAmostra, e.estilo)}>Internação do quarto 302</span>
                  <span className={s.apagado}>{e.uso}</span>
                </div>
              ))}
              <div className={s.escalaLinha}>
                <span className={s.escalaNome}>font-mono</span>
                <span className={s.escalaMono}>123.456.789-09 · CRM-MG 48.213 · 09:30 – 10:00</span>
                <span className={s.apagado}>CPF, registro, horário, nº do quarto</span>
              </div>
            </Cartao>
          </Secao>

          <Secao id="forma" titulo="Forma e espaço" descricao="Grade de 4px. Dois raios: 7px para controles, 12px para contêineres. Sombra só no que flutua (menus, modais, avisos).">
            <div className={s.grade3Sm}>
              <Exemplo titulo="rounded-control · 7px">
                <div className={s.raioControle} />
              </Exemplo>
              <Exemplo titulo="rounded-card · 12px">
                <div className={s.raioCartao} />
              </Exemplo>
              <Exemplo titulo="shadow-pop · shadow-modal">
                <div className={s.sombraPop} />
                <div className={s.sombraModal} />
              </Exemplo>
            </div>
            <div className={s.espacos}>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <div key={n} className={s.espaco}>
                  <div className={s.espacoQuadrado} style={{ width: n * 4, height: n * 4 }} />
                  <span className={s.espacoValor}>{n * 4}</span>
                </div>
              ))}
            </div>
          </Secao>

          <Secao id="botoes" titulo="Botões" descricao="Um primário por tela. Perigo só para ação destrutiva confirmada em modal.">
            <div className={s.pilha}>
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
            <div className={s.grade2}>
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
            <Cartao className={s.formulario}>
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
              <Campo rotulo="Observações" className={s.campoLargo}>
                {(p) => <AreaTexto {...p} placeholder="Queixa, exame físico, conduta…" />}
              </Campo>
              <Busca valor={busca} aoMudar={setBusca} placeholder="Nome ou CPF" aria-label="Exemplo de busca" />
            </Cartao>
          </Secao>

          <Secao id="navegacao" titulo="Navegação" descricao="Abas trocam a seção da página; segmentado troca o modo de ver os mesmos dados; pílulas filtram.">
            <div className={s.pilha}>
              <Exemplo titulo="Abas" className={s.exemploAbas}>
                <Abas
                  rotulo="Exemplo de abas"
                  valor={aba}
                  aoMudar={setAba}
                  className={s.abasSoltas}
                  opcoes={[
                    { valor: 'geral', rotulo: 'Visão geral' },
                    { valor: 'historico', rotulo: 'Histórico médico', contagem: 14 },
                  ]}
                />
              </Exemplo>
              <div className={s.grade2}>
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
            <div className={s.alertas}>
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
            <div className={s.botoesFeedback}>
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

          <Secao
            id="assinatura"
            titulo="Elementos do Vitalis"
            descricao="As peças que só um sistema hospitalar teria. Cada uma vem de um objeto que a equipe já conhece — a pulseira, o painel da recepção, o monitor, a planta do andar."
          >
            <div className={s.pilha}>
              <Exemplo titulo="Pulseira de identificação · cabeçalho da ficha do paciente" className={s.exemploBloco}>
                <Pulseira paciente={buscarPaciente(3)!} quarto="201" />
              </Exemplo>
              <div className={s.grade3}>
                <Exemplo titulo="CPF protegido · passe o mouse">
                  <CpfProtegido cpf="12345678909" />
                </Exemplo>
                <Exemplo titulo="Segure para confirmar · alta, cancelamento">
                  <BotaoSegurar feito="Consulta cancelada" aoConfirmar={() => avisar({ titulo: 'Confirmado segurando o botão' })}>
                    Segure para cancelar
                  </BotaoSegurar>
                </Exemplo>
                <Exemplo titulo="Verificação de regra · RN2, RN3, RF7">
                  <span className={s.marcas}>
                    <StatusMark status="pending" size={20} color="var(--ink-3)" />
                    Pendente
                    <StatusMark status="done" size={20} doneColor="var(--ok)" />
                    Atendida
                    <StatusMark status="failed" size={20} errorColor="var(--danger)" />
                    Violada
                  </span>
                </Exemplo>
              </div>
              <Exemplo titulo="Leitos em planta baixa · mapa de quartos">
                <LeitosOcupacao ocupacao={2} capacidade={4} situacao="DISPONIVEL" />
                <LeitosOcupacao ocupacao={2} capacidade={2} situacao="OCUPADO" />
                <LeitosOcupacao ocupacao={0} capacidade={3} situacao="MANUTENCAO" />
              </Exemplo>
              <p className={s.apagado}>
                No painel ficam os outros dois: o <strong>painel de chamada</strong>, com plaquinhas que viram como o letreiro da sala de espera, e o{' '}
                <strong>fluxo do dia</strong>, as consultas por hora traçadas como a fita de um monitor cardíaco. Ao agendar, o <strong>comprovante</strong> tem um
                canhoto que se destaca puxando para o lado.
              </p>
            </div>
          </Secao>

          <Secao id="dados" titulo="Dados" descricao="Métricas, ocupação, pessoas, tabelas e estados vazios.">
            <div className={s.grade3}>
              <Metrica rotulo="Ocupação" valor="78%" detalhe="39 de 50 vagas">
                <BarraProgresso valor={39} total={50} />
              </Metrica>
              <Metrica rotulo="Internações ativas" valor="21" detalhe="3 altas previstas hoje" />
              <Cartao>
                <CabecalhoCartao titulo="Ocupação do quarto" descricao="Um ponto por vaga — RN5 visível" />
                <CorpoCartao className={s.ocupacoes}>
                  <span className={s.ocupacao}>
                    Disponível <PontosOcupacao ocupacao={2} capacidade={4} situacao="DISPONIVEL" />
                  </span>
                  <span className={s.ocupacao}>
                    Lotado <PontosOcupacao ocupacao={2} capacidade={2} situacao="OCUPADO" />
                  </span>
                  <span className={s.ocupacao}>
                    Manutenção <PontosOcupacao ocupacao={0} capacidade={3} situacao="MANUTENCAO" />
                  </span>
                </CorpoCartao>
              </Cartao>
            </div>
            <div className={cn(s.grade2, s.acima)}>
              <Cartao className={s.recorte}>
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
                      <Td className={cn('mono', s.semQuebra)}>123.456.789-09</Td>
                      <Td>
                        <Selo tom="brand">Internado · 202</Selo>
                      </Td>
                    </tr>
                    <tr>
                      <Td>
                        <Pessoa nome="Bruno Henrique Santos" detalhe="51 anos" tamanho="sm" />
                      </Td>
                      <Td className={cn('mono', s.semQuebra)}>987.654.321-00</Td>
                      <Td>
                        <span className={s.apagado}>Ambulatorial</span>
                      </Td>
                    </tr>
                  </tbody>
                </Tabela>
              </Cartao>
              <Cartao>
                <EstadoVazio icone={<Users />} titulo="Nenhum paciente encontrado" descricao="Estados vazios dizem o que aconteceu e o próximo passo." className={s.vazioCompacto} />
              </Cartao>
            </div>
            <div className={cn(s.grade2, s.acima)}>
              <Cartao className={s.cartaoRespiro}>
                <ListaDefinicao
                  itens={[
                    { rotulo: 'CPF', valor: '123.456.789-09', mono: true },
                    { rotulo: 'Telefone', valor: '(31) 98765-4321' },
                    { rotulo: 'Nascimento', valor: '14 de março de 1990' },
                    { rotulo: 'Complemento', valor: null },
                  ]}
                />
              </Cartao>
              <Cartao className={s.avatares}>
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
