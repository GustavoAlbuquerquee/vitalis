# Regras de negócio

As regras de negócio do enunciado e da fatia implementada, cada uma com dono,
mecanismo de garantia e cenário de teste.

> **Regra do repositório:** alterou uma regra? Este arquivo é atualizado no mesmo pull request.

---

## RN1 — Um paciente pode ter várias consultas e internações

**Dono:** [`pacientes`](../modulos/pacientes)

Um paciente acumula atendimentos ao longo do tempo. Nenhum atendimento anterior é sobrescrito ou removido quando um novo acontece.

| Garantia | Onde |
|---|---|
| Associação `1 → 0..*` de `Paciente` para `Consulta` e `Internacao` | Modelo |
| Paciente é desativado, nunca excluído fisicamente | Serviço |

**Cenário de teste:** um paciente com três consultas e duas internações devolve todos os cinco atendimentos ao ser consultado.

---

## RN2 — Toda consulta tem paciente e profissional responsável

**Dono:** [`consultas`](../modulos/consultas)

| Garantia | Onde |
|---|---|
| `paciente` e `profissional` são campos obrigatórios em `Atendimento` | Modelo |
| Validação de obrigatoriedade no DTO de entrada | Controller |
| Existência verificada antes de gravar | Serviço |
| Chave estrangeira não-nula | Banco |

**Cenário de teste:** agendar consulta sem profissional devolve `400`; com profissional inexistente devolve `404`.

---

## RN3 — Um profissional não pode ter dois atendimentos agendados no mesmo horário

**Dono:** [`consultas`](../modulos/consultas) e [`procedimentos`](../modulos/procedimentos)

A regra vale para consultas agendadas e procedimentos cirúrgicos. Ambos herdam
de `Atendimento`; internações também reutilizam a abstração, mas não ocupam a
agenda horária.

### O algoritmo

```
conflitaCom(outro) = this.getInicio() < outro.getFim()
                  && outro.getInicio() < this.getFim()
```

Dois intervalos se sobrepõem quando cada um começa antes do outro terminar. Um único método, herdado, cobre as modalidades de atendimento.

| Garantia | Onde |
|---|---|
| `Atendimento.conflitaCom()` compara profissional, intervalo e situação de agenda | Modelo |
| `AgendaService` valida consultas e procedimentos antes de gravar ou iniciar | Serviço |
| Verificação de que o horário cai em uma janela de `Disponibilidade` | Serviço |
| Operações de agenda serializadas em memória | Serviço; persistência/índice pendentes da escolha do banco |

**Exceção:** `ConflitoDeHorarioException` → `409`

**Cenários de teste:**

| Existente | Novo | Resultado |
|---|---|---|
| 14:00–14:30 | 14:00–14:30 | conflito |
| 14:00–14:30 | 14:15–14:45 | conflito |
| 14:00–14:30 | 13:45–14:15 | conflito |
| 14:00–14:30 | 14:30–15:00 | **sem** conflito (fim é exclusivo) |
| 14:00–14:30 | 13:00–14:00 | **sem** conflito |
| consulta 14:00–14:30 | procedimento 14:10–15:10 com o mesmo cirurgião | conflito — a agenda cruza os dois tipos |

---

## RN4 — Toda internação tem paciente e quarto disponível

**Dono:** [`internacoes`](../modulos/internacoes)

| Garantia | Onde |
|---|---|
| `paciente` e `quarto` obrigatórios | Modelo |
| `InternacaoService` verifica `Quarto.estaDisponivel()` antes de reservar | Serviço |
| Um paciente não pode ter duas internações `ATIVA` | Serviço |

**Exceções:** `QuartoIndisponivelException` e `PacienteJaInternadoException` → `409`

**Cenário de teste:** internar em quarto `MANUTENCAO` é recusado; internar paciente que já está internado é recusado.

---

## RN5 — Um quarto nunca ultrapassa sua capacidade máxima

**Dono:** [`quartos`](../modulos/quartos)

| Garantia | Onde |
|---|---|
| `Quarto.ocupar()` recusa quando `getOcupacaoAtual() == capacidadeMaxima` | Modelo |
| `Quarto.ocupar()` recusa quando não há vaga disponível | Modelo |
| `getSituacao()` recalcula a situação a partir de bloqueio e ocupação | Modelo |

**Exceção:** `CapacidadeExcedidaException` → `409`

**Cenário de teste:** quarto com capacidade 2 e duas internações ativas recusa a terceira; após uma alta, aceita.

> A `situacao` do quarto é **derivada**, nunca digitada. Campo derivado não diverge da realidade.

---

## RN6 — O histórico de consultas e internações é preservado

**Dono:** [`historico`](../modulos/historico)

| Garantia | Onde |
|---|---|
| Cancelar é mudar o `status`, não excluir o registro | Serviço |
| Alta muda o status para `ALTA_CONCEDIDA` e mantém a internação | Modelo |
| `HistoricoMedico` é derivado dos dados já persistidos, sem duplicação | Serviço |

**Cenário de teste:** uma consulta cancelada continua aparecendo no histórico, com status `CANCELADA`.

---

## RN7 — Toda operação respeita disponibilidade de recursos e integridade dos dados

**Dono:** todos os módulos

| Garantia | Onde |
|---|---|
| Operações compostas são serializadas no estado em memória; com banco, devem usar transação | Serviço |
| Validação em quatro níveis: DTO, serviço, modelo e banco | Todas as camadas |
| Nenhuma regra implementada duas vezes | Fronteira de módulo |

**Cenário de teste:** se a atualização do quarto falhar durante uma internação, a internação não é criada.

---

## RN8 — A categoria do profissional define seus dados e responsabilidades

**Dono:** [`profissionais`](../modulos/profissionais)

`ProfissionalSaude` é abstrata e compartilha identidade e contato. Clínicos
gerais, especialistas e cirurgiões são tipos distintos; somente especialistas
possuem especialidade e somente cirurgiões podem responder por um procedimento
cirúrgico. O registro profissional é único, mesmo com diferenças de pontuação
ou caixa. Janelas do mesmo dia não podem se sobrepor.

**Cenário de teste:** um registro repetido com formatação diferente é recusado;
uma janela sobreposta no mesmo dia é recusada; clínico geral registra
encaminhamento e profissional de outra categoria não consegue fazê-lo.

---

## RN9 — Um procedimento só pode ser concluído depois de iniciado

**Dono:** [`procedimentos`](../modulos/procedimentos)

`ProcedimentoCirurgico` exige `Cirurgiao`, mantém observações pré e
pós-operatórias separadas, e guarda horários previsto e efetivo em campos
distintos. A transição `AGENDADO → CONCLUIDO` é proibida no próprio modelo.
Cancelamento só é permitido em `AGENDADO` ou `EM_ANDAMENTO`.

**Cenário de teste:** tentar concluir um procedimento agendado lança
`TransicaoInvalidaException` e não altera seu estado.

---

## RN10 — Ocupação e situação do quarto refletem o estado real

**Dono:** [`quartos`](../modulos/quartos) e [`internacoes`](../modulos/internacoes)

A entrada e a alta alteram juntas a internação e a ocupação do quarto. O tipo
do quarto é apenas informativo e não altera a capacidade; decisão registrada
no [ADR 0008](decisoes/0008-regra-tipo-quarto-informativo.md).

**Cenário de teste:** capacidade 2 recusa a terceira internação; uma alta libera
uma vaga; manutenção ou interdição recusam novas internações.

---

## Rastreabilidade

### Modalidades da Sprint 2 (issue #8)

### Estados da consulta (issue #9)

| De | Para |
|---|---|
| AGENDADA | CONFIRMADA, CANCELADA, NAO_COMPARECEU |
| CONFIRMADA | EM_ATENDIMENTO, CANCELADA, NAO_COMPARECEU |
| EM_ATENDIMENTO | CONCLUIDA, CANCELADA |
| CONCLUIDA, CANCELADA, NAO_COMPARECEU | Nenhum (finais) |

Esta é a tabela proposta na issue #9, adotada nesta implementação; a issue #4
ainda não contém confirmação do grupo. `Transicoes` valida antes da atribuição;
tentativas inválidas retornam 409 e preservam estado e observações. Observações
médicas são registradas na conclusão ou depois dela. Cancelamento e falta liberam
a agenda sem excluir o registro.

### Validações das modalidades

- Rotina e especializada exigem que o intervalo inteiro caiba na disponibilidade.
- Especializada também exige a mesma `Especialidade` do profissional (409).
- Paciente e profissional precisam estar ativos em todas as modalidades.
- Emergência é imediata: não consulta nem reserva a agenda de agendamentos.
- `AgendaService` reúne as implementações de `FonteAgenda` de cada módulo e usa
  exclusivamente `Atendimento.conflitaCom`. Cirurgias e internações devem publicar
  seus intervalos por essa interface; consultas não acessam seus repositórios.
- Intervalos adjacentes são aceitos. A comparação é por profissional, inclusive
  quando os identificadores dos atendimentos coincidem entre módulos.

### Emergência e fila (issue #10)

- Prioridades são `BAIXA`, `MODERADA`, `ALTA`, `CRITICA`, com peso explícito.
- A chegada é registrada pelo servidor; não aceita data/horário de agendamento.
- A presença é confirmada na chegada por transição validada. A projeção na API é
  `AGUARDANDO`; pode iniciar diretamente, concluir depois do início ou cancelar.
- A emergência não admite confirmação repetida nem não comparecimento.
- O filtro `modalidade=EMERGENCIA` ordena por gravidade decrescente e chegada
  crescente, com ID crescente como último desempate. Pode filtrar `AGUARDANDO`,
  `EM_ATENDIMENTO`, `CONCLUIDA` e `CANCELADA`.
- `AGUARDANDO` exige o filtro explícito de emergência. Os demais estados seguem
  os seis valores da consulta; não há valores textuais livres.
- Início e conclusão registram seus momentos, sem permitir tempos invertidos.
- A fila inclui apenas os registros do grupo solicitado; a conclusão e o
  cancelamento preservam o registro para consulta.

| Regra | Módulo dono | Exceção | HTTP |
|---|---|---|---|
| RN1 | `pacientes` | — | — |
| RN2 | `consultas` | `DadosInvalidosException` | 400 |
| RN3 | `consultas`, `internacoes` | `ConflitoDeHorarioException` | 409 |
| RN4 | `internacoes` | `QuartoIndisponivelException` | 409 |
| RN5 | `quartos` | `CapacidadeExcedidaException` | 409 |
| RN6 | `historico` | — | — |
| RN7 | todos | `RegraDeNegocioException` | 409 |
| RN8 | `profissionais` | `RegistroProfissionalDuplicadoException`, `ConflitoDisponibilidadeException` | 409 |
| RN9 | `procedimentos` | `TransicaoInvalidaException` | 422 |
| RN10 | `quartos`, `internacoes` | `QuartoIndisponivelException`, `CapacidadeExcedidaException` | 409 |
