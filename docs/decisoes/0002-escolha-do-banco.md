# ADR 0002 — Escolha do banco de dados

**Status:** proposta — aguardando decisão do time
**Data:** 2026-09-21

## Contexto

O enunciado permite duas abordagens e exige justificativa técnica na documentação:

- Banco relacional (MySQL, PostgreSQL ou equivalente)
- Banco não relacional orientado a documentos (MongoDB)

O modelo do Vitalis tem características que pesam nessa escolha:

| Característica | Implicação |
|---|---|
| Relacionamentos densos entre entidades | Consulta, internação, paciente, profissional e quarto se referenciam o tempo todo |
| Duas regras dependem de contagem e unicidade (RN3 e RN5) | Precisam de garantia forte, não eventual |
| Internar é uma operação com três passos que precisam ser atômicos | Transação multi-entidade |
| Herança no domínio (`Pessoa`, `Atendimento`) | Precisa de estratégia de mapeamento |
| Volume de dados pequeno, mesmo em produção real | Escala horizontal não é um fator |

## Alternativas consideradas

### PostgreSQL

| A favor | Contra |
|---|---|
| Transação ACID resolve a RN5 sem código extra | Requer definir estratégia de mapeamento de herança |
| Índice único garante a RN3 mesmo com bug na aplicação | Migrações de schema a manter |
| Chave estrangeira impede consulta órfã | — |
| `JOIN` nativo para o histórico, que cruza três entidades | — |

### MongoDB

| A favor | Contra |
|---|---|
| `endereco` e `disponibilidades` embutem naturalmente | Sem transação entre coleções por padrão — a RN5 fica exposta a condição de corrida |
| Schema flexível ajuda se novos campos surgirem | Herança vira documento com campos opcionais, e a validação some |
| Modelo de documento casa com prontuário | O histórico exige juntar três coleções na mão |

### MySQL

Equivalente ao PostgreSQL para este projeto. A escolha entre os dois seria por familiaridade do time.

## Decisão proposta

**PostgreSQL**, pelo argumento decisivo: duas das sete regras de negócio (RN3 e RN5) são restrições de integridade, e o relacional as garante no nível do banco. Se um bug passar pela camada de serviço, o índice único e a transação impedem que o dado se corrompa. No MongoDB, essas mesmas garantias viram código que o time precisa escrever e acertar.

A flexibilidade de schema, principal vantagem do modelo de documentos, tem pouco valor aqui: o domínio hospitalar é estável e está inteiramente descrito no [diagrama de classes](../diagrama-de-classes.md).

## Consequências

**Se PostgreSQL for confirmado**

- Estratégia de herança: uma tabela por subclasse ([modelo de dados](../modelo-de-dados.md))
- Migrações versionadas no repositório desde o primeiro dia
- A verificação da RN3 precisa cruzar as tabelas `consulta` e `internacao`

**Se o time optar por MongoDB**

- A RN5 exige operação atômica explícita de incremento com verificação
- Transação multi-documento requer replica set configurado
- Este ADR é substituído por um novo, documentando o motivo

> **Ação pendente:** o time decide na próxima reunião. Até lá, nenhuma decisão de persistência entra no código — a camada de repositório é uma interface, e trocar a implementação não toca em nenhuma regra de negócio.
