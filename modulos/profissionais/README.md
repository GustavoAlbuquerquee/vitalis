# Módulo `profissionais`

Quem atende.

## Responsabilidade

Manter o cadastro dos profissionais da saúde e as janelas de horário em que cada um atende. É a fonte da verdade sobre **quem pode atender e quando** — os módulos de consulta e internação consultam este módulo antes de marcar qualquer coisa.

## Entidades

| Entidade | Atributos principais |
|---|---|
| `ProfissionalSaude` (herda de `Pessoa`) | `nome`, `registroProfissional`, `especialidade`, `telefone`, `email` |
| `Disponibilidade` | `diaSemana`, `horaInicio`, `horaFim`, `ativo` |
| `Especialidade` *(enumeração)* | `CLINICA_GERAL`, `CARDIOLOGIA`, `PEDIATRIA`, `ORTOPEDIA`, … |
| `DiaSemana` *(enumeração)* | `SEGUNDA` … `DOMINGO` |

`ProfissionalSaude` implementa `getIdentificacaoPrincipal()` devolvendo o registro profissional (CRM, COREN, CREFITO…).

A relação com `Disponibilidade` é de **composição**: a janela de horário não existe sem o profissional. Apagou o profissional, apagou a agenda dele.

## Regras que este módulo garante

| # | Regra |
|---|---|
| — | O registro profissional é único |
| — | Duas janelas de disponibilidade do mesmo profissional não podem se sobrepor no mesmo dia |
| — | `estaDisponivelEm(inicio, fim)` responde se o intervalo cabe em alguma janela ativa |

> A **RN3** (dois atendimentos no mesmo horário) é verificada pelos módulos [`consultas`](../consultas) e [`internacoes`](../internacoes), que perguntam a este módulo se o horário é válido. Este módulo diz *quando o profissional atende*; os outros dizem *o que já está marcado*.

## Endpoints previstos

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/profissionais` | Cadastra um profissional |
| `GET` | `/profissionais/{id}` | Busca por identificador |
| `GET` | `/profissionais?especialidade=` | Lista, com filtro por especialidade |
| `PUT` | `/profissionais/{id}` | Atualiza o cadastro |
| `POST` | `/profissionais/{id}/disponibilidades` | Define uma janela de atendimento |
| `GET` | `/profissionais/{id}/agenda?data=` | Agenda do dia |

## Dependências

`comum`

## O que **não** pertence aqui

- Marcar consulta — é do módulo [`consultas`](../consultas)
- Registrar internação — é do módulo [`internacoes`](../internacoes)
