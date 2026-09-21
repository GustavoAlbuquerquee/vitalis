# Módulo `quartos`

Onde o paciente fica.

## Responsabilidade

Gerenciar os leitos do hospital: identificação, andar, capacidade e situação de ocupação. É a única fonte da verdade sobre **se existe vaga** — nenhum outro módulo decide isso por conta própria.

## Entidades

| Entidade | Atributos principais |
|---|---|
| `Quarto` | `numero`, `andar`, `capacidadeMaxima`, `tipo`, `situacao` |
| `TipoQuarto` *(enumeração)* | `ENFERMARIA`, `APARTAMENTO`, `UTI`, `ISOLAMENTO` |
| `SituacaoQuarto` *(enumeração)* | `DISPONIVEL`, `OCUPADO`, `MANUTENCAO`, `INTERDITADO` |

## Regras que este módulo garante

| # | Regra | Como |
|---|---|---|
| **RN5** | Um quarto nunca ultrapassa sua capacidade máxima | `ocupar()` lança `CapacidadeExcedidaException` se não houver vaga |
| — | O número do quarto é único | Índice único |
| — | A situação é **derivada**, não digitada | `atualizarSituacao()` roda após toda ocupação e liberação |
| — | Quarto em `MANUTENCAO` ou `INTERDITADO` não recebe paciente | `estaDisponivel()` devolve `false` |

### Por que a situação é derivada

`situacao` nunca é escrita à mão. Ela é recalculada a partir da ocupação real:

```
estaDisponivel() = situacao não é MANUTENCAO nem INTERDITADO
                && getOcupacaoAtual() < capacidadeMaxima
```

Se `situacao` fosse um campo editável, mais cedo ou mais tarde ele discordaria da realidade — um quarto marcado como disponível e cheio de pacientes. Campo derivado não mente.

## Endpoints previstos

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/quartos` | Cadastra um quarto |
| `GET` | `/quartos/{id}` | Busca por identificador |
| `GET` | `/quartos?situacao=DISPONIVEL&andar=` | Lista com filtros |
| `GET` | `/quartos/{id}/ocupacao` | Ocupação atual e vagas restantes |
| `PATCH` | `/quartos/{id}/situacao` | Coloca em manutenção ou libera |

## Dependências

`comum`

## O que **não** pertence aqui

- Internar o paciente — é do módulo [`internacoes`](../internacoes). Este módulo diz **se cabe**; o outro decide **quem entra**.
