# ADR 0003 — `Atendimento` como superclasse abstrata

**Status:** aceita
**Data:** 2026-09-21

## Contexto

A **RN3** diz: *um profissional não poderá possuir dois atendimentos agendados para o mesmo horário.*

O enunciado usa a palavra "atendimentos", não "consultas". E faz sentido: um médico que está conduzindo uma internação às 14h não pode estar em consulta ambulatorial às 14h. A regra cruza os dois tipos.

Consulta e internação, porém, são coisas diferentes: uma tem `data` e `horario`; a outra tem `dataEntrada`, `dataPrevistaAlta` e `dataEfetivaAlta`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| **Duas classes independentes** | A verificação de conflito precisaria ser escrita duas vezes, com dois formatos de data diferentes. Na primeira manutenção, uma das duas é atualizada e a outra não — e a RN3 passa a valer só metade das vezes. |
| **Uma classe `Atendimento` concreta com campo de tipo** | Consulta carregaria `dataPrevistaAlta` nula e internação carregaria `motivo da consulta` nulo. Metade dos campos sempre vazios, e nenhuma validação consegue ser obrigatória. |
| **Interface `Agendavel` em vez de classe abstrata** | Resolveria o polimorfismo do conflito, mas deixaria `paciente`, `profissional` e `observacoes` duplicados nas duas classes — são atributos, não comportamento. |

## Decisão

`Atendimento` é uma **classe abstrata** com `paciente`, `profissional` e `observacoes`, e três métodos abstratos:

```
getInicio() : LocalDateTime
getFim()    : LocalDateTime
getResumo() : String
```

`Consulta` calcula o intervalo a partir de `data`, `horario` e `duracaoMinutos`. `Internacao` calcula a partir de `dataEntrada` e `dataEfetivaAlta` (ou `dataPrevistaAlta`, se ainda ativa).

A verificação de conflito vive uma única vez, na superclasse:

```
conflitaCom(outro) = this.getInicio() < outro.getFim()
                  && outro.getInicio() < this.getFim()
```

## Consequências

**O que ganhamos**

- A RN3 é um algoritmo só, e cobre automaticamente qualquer novo tipo de atendimento que venha a existir (exame, procedimento, cirurgia)
- O histórico médico é uma lista de `Atendimento`, ordenável por `getInicio()` sem saber de que tipo é cada item
- `RegistroClinico` se liga a `Atendimento`, não a consulta e internação separadamente

**O que aceitamos conviver**

- Mapeamento de herança no banco exige uma decisão explícita ([modelo de dados](../modelo-de-dados.md))
- A busca de conflito precisa consultar duas tabelas e unir os resultados
- `duracaoMinutos` passa a ser obrigatório na consulta — sem ele não existe `getFim()`, e sem `getFim()` não existe verificação de conflito
