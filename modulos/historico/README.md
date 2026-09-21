# Módulo `historico`

A memória do hospital sobre cada paciente.

## Responsabilidade

Consolidar, em uma visão só, tudo que já aconteceu com um paciente: consultas realizadas, internações, e os registros clínicos feitos durante os atendimentos.

## Entidades

| Entidade | Atributos principais |
|---|---|
| `HistoricoMedico` *(agregado)* | `paciente`, `consultas`, `internacoes`, `registros` |
| `RegistroClinico` | `atendimento`, `autor`, `tipo`, `descricao`, `dataRegistro` |
| `TipoRegistro` *(enumeração)* | `ANAMNESE`, `DIAGNOSTICO`, `PRESCRICAO`, `EXAME`, `EVOLUCAO` |

## A decisão central: o histórico não é armazenado

`HistoricoMedico` **não tem tabela**. Ele é montado em memória a partir do que os módulos [`consultas`](../consultas) e [`internacoes`](../internacoes) já persistem.

Por quê:

| Se fosse armazenado | Sendo derivado |
|---|---|
| Os mesmos dados existiriam em dois lugares | Uma fonte da verdade por informação |
| Cancelar uma consulta exigiria atualizar o histórico também | O histórico reflete a mudança sozinho |
| Um bug de sincronização produziria histórico mentindo sobre o passado | Impossível divergir |

O custo é uma consulta um pouco mais cara na leitura. A troca compensa: histórico médico errado é um problema clínico, não um problema de performance.

`RegistroClinico`, ao contrário, **é** persistido — ele é informação original, digitada durante o atendimento, não derivada de nada.

## Regras que este módulo garante

| # | Regra | Como |
|---|---|---|
| **RN6** | O histórico de consultas e internações é preservado | Lê registros que nunca são excluídos fisicamente |
| — | O histórico é sempre de um paciente específico | Não existe histórico "geral" |
| — | Todo registro clínico tem autor e momento | Rastreabilidade de quem escreveu o quê |

## Endpoints previstos

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/pacientes/{id}/historico` | Histórico completo do paciente |
| `GET` | `/pacientes/{id}/historico?de=&ate=` | Recorte por período |
| `POST` | `/atendimentos/{id}/registros` | Adiciona um registro clínico ao atendimento |
| `GET` | `/atendimentos/{id}/registros` | Lista os registros de um atendimento |

## Dependências

`pacientes` · `consultas` · `internacoes` · `comum`

## O que **não** pertence aqui

- Alterar uma consulta ou internação — este módulo **só lê** o que os outros gravaram
- Regra sobre agendamento ou ocupação — nenhuma decisão de negócio dos outros módulos vive aqui
