# ADR 0008 — Tipo de quarto informativo

**Status:** aceita
**Data:** 2026-11-09

## Contexto

A demanda de quartos solicita regras relacionadas ao tipo, mas o enunciado lista
`ENFERMARIA`, `APARTAMENTO`, `UTI` e `ISOLAMENTO` sem definir diferenças de
capacidade, critérios de admissão ou indicação clínica. Aplicar uma dessas
regras sem validação do professor criaria uma política clínica não especificada.

## Alternativas consideradas

| Alternativa | Motivo para não escolher |
|---|---|
| UTI com capacidade máxima de um paciente | A capacidade é um atributo configurável do quarto e o enunciado não vincula o valor ao tipo |
| Apartamento individual e enfermaria coletiva | A regra e seus limites não estão definidos |
| Isolamento sujeito a indicação clínica | Não há campo nem regra para a indicação no enunciado |

## Decisão

O tipo do quarto é **informativo** e não impõe restrições adicionais de ocupação.
Capacidade máxima, situação administrativa e ocupação real determinam se o
quarto pode receber uma internação. O usuário confirmou esta interpretação em
2026-11-09.

## Consequências

- Os quatro tipos permanecem disponíveis para classificação e consulta.
- A capacidade continua definida por quarto, sem inferência baseada no tipo.
- Uma resposta posterior do professor que estabeleça regras específicas deve
  substituir esta decisão por um novo ADR.
