# Requisitos

## Contexto

Um hospital de médio porte decidiu substituir seus registros manuais por um sistema informatizado que centralize e gerencie as informações dos atendimentos. Os objetivos são organizar os dados, reduzir erros operacionais e fornecer informação confiável para as atividades administrativas e médicas.

## Escopo

O sistema deve permitir:

- Gerenciamento de pacientes
- Gerenciamento de profissionais da saúde
- Agendamento e controle de consultas
- Controle de internações
- Gerenciamento de quartos hospitalares
- Controle de disponibilidade de atendimento
- Registro do histórico de atendimentos dos pacientes
- Consulta de informações médicas e administrativas

## Requisitos funcionais

### RF1 — Paciente

O sistema deve armazenar, no mínimo: nome, CPF, data de nascimento, telefone, endereço e e-mail para contato.

| Atributo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `nome` | texto | sim | — |
| `cpf` | texto | sim | único, 11 dígitos |
| `dataNascimento` | data | sim | não pode ser futura |
| `telefone` | texto | sim | — |
| `endereco` | objeto | sim | logradouro, número, bairro, cidade, UF, CEP |
| `email` | texto | sim | formato válido |

**Módulo:** [`pacientes`](../modulos/pacientes)

### RF2 — Profissional da saúde

O sistema deve armazenar, no mínimo: nome, registro profissional, especialidade, telefone e e-mail para contato.

| Atributo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `nome` | texto | sim | — |
| `registroProfissional` | texto | sim | único (CRM, COREN, CREFITO…) |
| `especialidade` | enumeração | sim | — |
| `telefone` | texto | sim | — |
| `email` | texto | sim | formato válido |

**Módulo:** [`profissionais`](../modulos/profissionais)

### RF3 — Consulta

Uma consulta deve possuir, no mínimo: paciente, profissional responsável, data, horário, motivo da consulta e observações médicas.

| Atributo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `paciente` | referência | sim | RN2 |
| `profissional` | referência | sim | RN2 |
| `data` | data | sim | não pode ser passada no agendamento |
| `horario` | hora | sim | RN3 |
| `duracaoMinutos` | inteiro | sim | padrão 30, necessário para calcular conflito |
| `motivo` | texto | sim | — |
| `observacoesMedicas` | texto | não | preenchido na realização |
| `status` | enumeração | sim | derivado do ciclo de vida |

**Módulo:** [`consultas`](../modulos/consultas)

### RF4 — Internação

Uma internação deve possuir, no mínimo: paciente, profissional responsável, quarto, data de entrada, data prevista de alta, data efetiva de alta e observações.

| Atributo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `paciente` | referência | sim | RN4 |
| `profissional` | referência | sim | — |
| `quarto` | referência | sim | RN4, RN5 |
| `dataEntrada` | data e hora | sim | — |
| `dataPrevistaAlta` | data | sim | — |
| `dataEfetivaAlta` | data e hora | não | preenchida na alta |
| `observacoes` | texto | não | — |
| `status` | enumeração | sim | derivado do ciclo de vida |

**Módulo:** [`internacoes`](../modulos/internacoes)

### RF5 — Quarto

Um quarto deve possuir, no mínimo: número de identificação, andar, capacidade máxima de pacientes e situação atual (disponível ou ocupado).

| Atributo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `numero` | texto | sim | único |
| `andar` | inteiro | sim | — |
| `capacidadeMaxima` | inteiro | sim | maior que zero |
| `tipo` | enumeração | sim | enfermaria, apartamento, UTI, isolamento |
| `situacao` | enumeração | sim | **derivada** da ocupação, não digitada |

**Módulo:** [`quartos`](../modulos/quartos)

### RF6 — Histórico médico

O sistema deve permitir consultar o histórico de um paciente contendo: consultas realizadas, internações realizadas e informações relevantes registradas durante os atendimentos.

**Módulo:** [`historico`](../modulos/historico)

### RF7 — Disponibilidade de atendimento

O sistema deve controlar as janelas de horário em que cada profissional atende, por dia da semana.

**Módulo:** [`profissionais`](../modulos/profissionais)

## Requisitos não funcionais

| # | Requisito |
|---|---|
| **RNF1** | Acesso aos dados exclusivamente por API REST |
| **RNF2** | Persistência em banco de dados, com a escolha justificada tecnicamente ([ADR 0002](decisoes/0002-escolha-do-banco.md)) |
| **RNF3** | Tratamento de exceções padronizado, com resposta de erro em formato único |
| **RNF4** | Testes automatizados cobrindo as sete regras de negócio |
| **RNF5** | Arquitetura em camadas com fronteiras respeitadas entre módulos |

## Fora de escopo nesta versão

- Autenticação e autorização de usuários
- Faturamento e convênios
- Prescrição eletrônica e integração com farmácia
- Agenda de exames e laudos

> A modelagem deste documento representa os requisitos iniciais. Novas necessidades podem ser identificadas ao longo do desenvolvimento e incorporadas em versões posteriores.
