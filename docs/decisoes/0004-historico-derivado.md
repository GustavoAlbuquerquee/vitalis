# ADR 0004 — Histórico médico derivado, não armazenado

**Status:** aceita
**Data:** 2026-09-21

## Contexto

A **RN6** exige que o sistema mantenha o histórico de consultas e internações dos pacientes, e o **RF6** pede uma consulta que devolva esse histórico consolidado.

A pergunta é se `HistoricoMedico` deve ser uma entidade persistida — com tabela própria, atualizada a cada atendimento — ou uma visão montada em tempo de leitura.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| **Tabela `historico_medico` com linhas copiadas** | Os mesmos dados passariam a existir em dois lugares. Cancelar uma consulta exigiria lembrar de atualizar o histórico também — e um dia alguém esquece. Histórico médico que discorda do registro original é um problema clínico, não um bug qualquer. |
| **Tabela de histórico como log de eventos** | Seria correta e auditável, mas resolve um problema que o projeto não tem: ninguém pediu trilha de auditoria, e o custo de manter o log consistente não se paga aqui. |

## Decisão

`HistoricoMedico` é um **agregado derivado**, montado na camada de serviço do módulo [`historico`](../../modulos/historico) a partir do que `consultas`, `internacoes` e os registros clínicos já persistem.

Ele não tem tabela, não tem `id` e não é gravado.

Duas condições sustentam isso:

1. **Nada é excluído fisicamente.** Cancelar uma consulta muda o `status` para `CANCELADA`; dar alta muda para `ALTA_CONCEDIDA`. O registro permanece.
2. **`RegistroClinico` é persistido.** Ele *não* é derivado — é informação original, digitada durante o atendimento. Só o agregado que junta tudo é que é calculado.

## Consequências

**O que ganhamos**

- Uma fonte da verdade por informação — impossível o histórico divergir do registro original
- Cancelamentos, altas e correções aparecem no histórico automaticamente, sem código de sincronização
- Menos escrita: um atendimento grava em um lugar, não em dois

**O que aceitamos conviver**

- A leitura do histórico é mais cara: precisa buscar em três lugares e ordenar
- Filtro por período exige consulta bem indexada (`consulta(paciente_id, data DESC)`)
- Se o volume por paciente crescer muito, será preciso paginar o histórico — e a paginação sobre três fontes dá mais trabalho que sobre uma tabela só

A troca compensa: o custo é de performance, e performance tem solução conhecida. Histórico médico errado, não.
