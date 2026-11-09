# Módulo `profissionais`

Quem atende.

## Responsabilidade

Manter o cadastro dos profissionais da saúde e as janelas de horário em que cada um atende. É a fonte da verdade sobre **quem pode atender e quando** — os módulos de consulta e internação consultam este módulo antes de marcar qualquer coisa.

## Entidades

| Entidade | Atributos principais |
|---|---|
| `ProfissionalSaude` (abstrata, herda de `Pessoa`) | `nome`, `registroProfissional`, `telefone`, `email` |
| `ClinicoGeral` | Consultas de rotina e encaminhamentos |
| `Especialista` | `especialidade`; atende apenas na própria área |
| `Cirurgiao` | `areaCirurgica`; responsável por procedimentos cirúrgicos |
| `Disponibilidade` | `diaSemana`, `horaInicio`, `horaFim` |
| `Especialidade` *(enumeração)* | `CLINICA_GERAL`, `CARDIOLOGIA`, `PEDIATRIA`, `ORTOPEDIA`, … |
| `DiaSemana` *(enumeração)* | `SEGUNDA` … `DOMINGO` |

As três categorias compartilham identidade e contato pela superclasse. A
especialidade não fica na superclasse: clínicos gerais e cirurgiões têm dados
próprios. O registro profissional é único, sem diferenciar pontuação ou caixa.

A relação com `Disponibilidade` é de **composição**: a janela de horário não existe sem o profissional. Apagou o profissional, apagou a agenda dele.

## Regras que este módulo garante

| # | Regra |
|---|---|
| — | O registro profissional é único |
| — | Duas janelas de disponibilidade do mesmo profissional não podem se sobrepor no mesmo dia |
| — | `estaDisponivelEm(inicio, fim)` responde se o intervalo cabe em alguma janela ativa |
| — | Janelas não se sobrepõem no mesmo dia |
| — | Clínico geral pode registrar encaminhamentos para especialidade |

> A **RN3** (dois atendimentos agendados no mesmo horário) é verificada pelos módulos [`consultas`](../consultas) e [`procedimentos`](../procedimentos) por meio da agenda compartilhada. Este módulo diz *quando o profissional atende*; os outros dizem *o que já está marcado*.

## Endpoints

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/profissionais` | Cadastra um profissional |
| `GET` | `/profissionais/{id}` | Busca por identificador |
| `GET` | `/profissionais?especialidade=&tipo=` | Lista, com filtros por especialidade e categoria |
| `PUT` | `/profissionais/{id}` | Atualiza o cadastro |
| `POST` | `/profissionais/{id}/disponibilidades` | Define uma janela de atendimento |
| `POST` | `/profissionais/{id}/encaminhamentos` | Registra encaminhamento de paciente pelo clínico geral |
| `GET` | `/profissionais/{id}/encaminhamentos` | Consulta os encaminhamentos |
| `GET` | `/profissionais/{id}/agenda?data=` | Agenda do dia |

## Dependências

`comum`

## O que **não** pertence aqui

- Marcar consulta — é do módulo [`consultas`](../consultas)
- Registrar internação — é do módulo [`internacoes`](../internacoes)
