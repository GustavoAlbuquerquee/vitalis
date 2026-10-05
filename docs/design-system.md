# Design system

A linguagem visual do Vitalis: tokens, componentes e as regras de uso. A versão viva, com todos os componentes renderizados nos dois temas, fica na própria aplicação em **`/design-system`**.

> **Fonte da verdade:** os tokens moram em [`frontend/src/estilos/global.css`](../frontend/src/estilos/global.css) e os componentes em [`frontend/src/ds`](../frontend/src/ds). Este documento explica o porquê; o código diz o quê.

---

## Conceito — do papel ao pulso

O hospital está trocando papel por software. A interface assume isso: fundo em tom de papel, tinta escura, **um único verde vital** como cor de marca. A marca é o traçado de um sinal vital dentro de um quadrado — o registro que ganha pulso.

| Princípio | Na prática |
|---|---|
| **A regra aparece antes do erro** | Conflito de horário (RN3), capacidade do quarto (RN5) e paciente já internado (RN4) são avaliados enquanto o formulário é preenchido. O botão de envio fica desabilitado enquanto há violação. |
| **Dado clínico é preciso** | CPF, registro profissional, horários e número de quarto usam fonte mono com algarismos tabulares. |
| **Cor nunca é a única pista** | Todo status tem texto. A cor reforça, não substitui. |
| **Nada some** | Cancelar e desativar mudam o status; a interface sempre mostra o registro preservado (RN6). |

---

## Cores

Componentes **nunca** usam hex. Usam as utilidades do Tailwind geradas a partir das variáveis CSS (`bg-surface`, `text-ink-2`, `border-line`…). O tema escuro só redefine as variáveis.

### Superfícies e tinta

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `bg` | `#F6F5F1` | `#0D1311` | Fundo da aplicação |
| `surface` | `#FFFFFF` | `#141B19` | Cartões, tabelas, modais |
| `surface-2` | `#EFEDE7` | `#1A2220` | Menu lateral, cabeçalho de tabela |
| `surface-3` | `#E7E4DC` | `#212A28` | Trilhos de progresso |
| `line` | `#E2DFD6` | `#252F2C` | Bordas e divisórias |
| `line-strong` | `#CFCBBF` | `#34403C` | Borda de controles |
| `ink` | `#16201E` | `#E8ECEA` | Texto principal |
| `ink-2` | `#56605D` | `#A3ADA9` | Texto secundário |
| `ink-3` | `#868E8A` | `#737D79` | Rótulos e metadados |

### Marca

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `brand` | `#0E6B5C` | `#3FBFA4` | Botão primário, item ativo, foco |
| `brand-soft` | `#E2F0EC` | `#12352E` | Fundo de seleção |
| `brand-ink` | `#0A4F44` | `#7FDCC6` | Texto sobre `brand-soft` |

### Semânticas

Cada tom tem par sólido (texto, ícone, ponto) e suave (fundo).

| Tom | Significa no Vitalis |
|---|---|
| `ok` | Consulta realizada, alta concedida, quarto disponível |
| `info` | Consulta agendada, informação |
| `warn` | Quarto em manutenção, alta prevista para hoje |
| `danger` | Cancelada, quarto lotado, conflito, alta atrasada |
| `neutral` | Não compareceu, transferida, interditado |
| `brand` | Internação ativa |

O mapeamento enum → rótulo → tom fica em [`frontend/src/lib/rotulos.ts`](../frontend/src/lib/rotulos.ts). O mesmo status tem a mesma cor em qualquer tela.

---

## Tipografia

**Geist** para a interface, **Geist Mono** para dados. Base de 14px: o Vitalis é ferramenta de operação, densa por necessidade.

| Classe | Tamanho/linha | Uso |
|---|---|---|
| `text-2xl` | 32/40 | Título de página (desktop) |
| `text-xl` | 24/32 | Título de página (mobile), número de métrica |
| `text-lg` | 20/28 | Destaques |
| `text-md` | 16/24 | Título de modal |
| `text-base` | 14/22 | Texto padrão |
| `text-sm` | 13/20 | Apoio, botões pequenos |
| `text-xs` | 12/16 | Rótulos, selos, ajuda de campo |
| `text-2xs` | 11/16 | Sobretítulos em caixa-alta |

## Forma e espaço

- Grade de **4px**.
- Dois raios: **7px** (`rounded-control`) para controles e **12px** (`rounded-card`) para contêineres.
- Profundidade vem de **borda**. Sombra só no que flutua: `shadow-pop` (avisos, hover de blocos) e `shadow-modal`.

---

## Componentes

Todos em [`frontend/src/ds`](../frontend/src/ds), exportados por `@/ds`.

| Componente | Para quê |
|---|---|
| `Botao`, `BotaoLink`, `BotaoIcone` | Ações. Variantes `primario`, `secundario`, `fantasma`, `perigo`. **Um primário por tela.** |
| `Selo`, `Etiqueta` | Status (com ponto) e metadados (tipo de quarto, especialidade) |
| `Cartao`, `CabecalhoCartao`, `CorpoCartao` | Contêiner padrão |
| `Avatar` | Iniciais sobre cor estável derivada do nome |
| `Campo`, `Entrada`, `Selecao`, `AreaTexto`, `Busca`, `Secao` | Formulários. `Campo` liga rótulo, ajuda e erro ao controle (`aria-describedby`, `aria-invalid`) |
| `Abas`, `Segmentado`, `Pilulas` | Abas trocam a seção; segmentado troca o modo de ver; pílulas filtram |
| `Modal` | Confirmação do que muda estado. Fecha com Esc, prende o foco |
| `Alerta` | Mensagem presa ao contexto — usada para as regras de negócio |
| `ProvedorAvisos`, `useAviso`, `usePrototipo` | Avisos (toasts) |
| `CabecalhoPagina`, `Pagina`, `EstadoVazio`, `ListaDefinicao` | Estrutura de página |
| `Metrica`, `BarraProgresso`, `PontosOcupacao` | Números e ocupação. Um ponto por vaga do quarto — a RN5 visível |
| `Tabela`, `Th`, `Td`, `Linha` | Tabelas com linha inteira clicável |

Componentes de **domínio** (já vestidos com o vocabulário do hospital) ficam em [`frontend/src/componentes/dominio.tsx`](../frontend/src/componentes/dominio.tsx): `Pessoa`, `SeloConsulta`, `SeloInternacao`, `SeloQuarto`, `RegistrosClinicos`, `Horario`.

---

## Escrita

Segue o [glossário](glossario.md): *profissional da saúde* (não "médico"), *quarto* (não "leito"), *agendar* (não "marcar"), *desativar/cancelar* (não "deletar").

- Botões dizem a ação: "Agendar consulta", "Registrar alta" — nunca "OK" ou "Enviar".
- Estados vazios dizem o que aconteceu e qual o próximo passo.
- Mensagens de regra citam a regra (`RN3`) — o time reconhece de onde vem a restrição.

## Acessibilidade

- Contraste AA nos dois temas para texto `ink` e `ink-2`.
- Foco visível em todo controle (`outline` na cor `focus`).
- Link "Pular para o conteúdo", `aria-current` na navegação, `role="radiogroup"` nos seletores de horário e quarto.
- `prefers-reduced-motion` desliga animações.
