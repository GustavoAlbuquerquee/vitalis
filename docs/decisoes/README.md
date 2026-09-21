# Decisões de arquitetura (ADRs)

Um *Architecture Decision Record* registra uma decisão importante: o contexto que a motivou, as alternativas consideradas, a escolha e as consequências aceitas.

Por que registrar: daqui a dois meses ninguém lembra por que `Atendimento` é abstrata. Sem o registro, alguém "simplifica" o modelo e a RN3 passa a existir em dois lugares.

## Índice

| # | Decisão | Status |
|---|---|---|
| [0001](0001-arquitetura-em-camadas.md) | Arquitetura modular em camadas | Aceita |
| [0002](0002-escolha-do-banco.md) | Escolha do banco de dados | **Proposta** — precisa da decisão do time |
| [0003](0003-atendimento-como-superclasse.md) | `Atendimento` como superclasse abstrata | Aceita |
| [0004](0004-historico-derivado.md) | Histórico médico derivado, não armazenado | Aceita |

## Como escrever uma nova

Copie a estrutura de qualquer arquivo existente:

```markdown
# ADR NNNN — Título da decisão

**Status:** proposta · aceita · substituída por ADR NNNN
**Data:** AAAA-MM-DD

## Contexto
O que motivou a decisão.

## Alternativas consideradas
O que foi avaliado e por que não foi escolhido.

## Decisão
O que ficou decidido.

## Consequências
O que ganhamos e o que passamos a conviver.
```

Numeração sequencial. ADR nunca é apagada — quando uma decisão muda, a antiga vira "substituída por" e a nova explica o motivo.
