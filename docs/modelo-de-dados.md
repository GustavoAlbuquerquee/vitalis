# Modelo de dados

Como o domínio descrito no [diagrama de classes](diagrama-de-classes.md) vira armazenamento.

> A tecnologia ainda não foi fechada — veja [ADR 0002](decisoes/0002-escolha-do-banco.md). Este documento descreve as duas traduções possíveis para o mesmo modelo.

## Entidades e chaves

| Entidade | Chave primária | Chaves únicas | Chaves estrangeiras |
|---|---|---|---|
| `paciente` | `id` | `cpf` | — |
| `profissional` | `id` | `registro_profissional` | — |
| `disponibilidade` | `id` | (`profissional_id`, `dia_semana`, `hora_inicio`) | `profissional_id` |
| `consulta` | `id` | (`profissional_id`, `data`, `horario`) | `paciente_id`, `profissional_id` |
| `internacao` | `id` | — | `paciente_id`, `profissional_id`, `quarto_id` |
| `quarto` | `id` | `numero` | — |
| `registro_clinico` | `id` | — | `atendimento_id`, `autor_id` |

`historico_medico` **não tem tabela** — é derivado em tempo de leitura. Veja o [módulo `historico`](../modulos/historico).

## Relacional

### Herança de `Pessoa`

Estratégia: **uma tabela por subclasse** (`paciente` e `profissional` separadas, cada uma com as colunas herdadas).

| Alternativa | Por que não |
|---|---|
| Tabela única com discriminador | Metade das colunas sempre nula; CPF não poderia ser obrigatório |
| Tabela de `pessoa` + tabelas filhas | Todo acesso vira `JOIN`, sem ganho real — paciente e profissional quase nunca são consultados juntos |

### Herança de `Atendimento`

Mesma estratégia: `consulta` e `internacao` são tabelas independentes.

A verificação de conflito da **RN3** precisa varrer as duas — resolvida por uma consulta que une os intervalos das duas tabelas para o mesmo profissional.

### `Endereco`

Colunas embutidas na tabela `paciente` (`endereco_logradouro`, `endereco_cidade`, …). É um objeto de valor: não tem identidade nem vida própria.

### Índices que importam

| Índice | Por quê |
|---|---|
| `paciente(cpf)` único | RN — não existem dois cadastros da mesma pessoa |
| `profissional(registro_profissional)` único | Mesmo motivo |
| `quarto(numero)` único | Identificação do leito |
| `consulta(profissional_id, data, horario)` | RN3 — é a busca de conflito, roda em todo agendamento |
| `internacao(quarto_id, status)` | RN5 — conta ocupação atual do quarto |
| `internacao(paciente_id, status)` | Paciente já internado |
| `consulta(paciente_id, data DESC)` | Histórico do paciente |

## Não relacional (documentos)

Se a escolha for MongoDB:

| Coleção | Contém |
|---|---|
| `pacientes` | Paciente com `endereco` embutido |
| `profissionais` | Profissional com `disponibilidades` embutidas |
| `consultas` | Documento próprio, com referência a paciente e profissional |
| `internacoes` | Documento próprio, com referência a paciente, profissional e quarto |
| `quartos` | Documento próprio |
| `registros_clinicos` | Documento próprio, com referência ao atendimento |

**O que embutir e o que referenciar:**

- `endereco` e `disponibilidades` são **embutidos** — não fazem sentido sozinhos e são lidos junto com o dono
- Consultas e internações são **referenciadas** — crescem sem limite ao longo dos anos, e um documento de paciente com dez anos de atendimentos ficaria grande e lento

**O custo:** sem transação entre coleções por padrão, a RN5 (capacidade do quarto) precisa de cuidado explícito — duas internações simultâneas poderiam ver o mesmo quarto como disponível. Resolvível com operação atômica de incremento e verificação, mas é trabalho que o relacional entrega de graça.

## Integridade que o banco garante sozinho

| Garantia | Relacional | Documentos |
|---|---|---|
| CPF único | índice único | índice único |
| Consulta sem paciente | chave estrangeira | validação de schema |
| Quarto além da capacidade | restrição + transação | operação atômica manual |
| Atomicidade da internação | transação | transação multi-documento (requer replica set) |
