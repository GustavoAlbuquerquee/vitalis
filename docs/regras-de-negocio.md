# Regras de negócio

As sete regras do enunciado, cada uma com dono, mecanismo de garantia e cenário de teste.

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

## RN3 — Um profissional não pode ter dois atendimentos no mesmo horário

**Dono:** [`consultas`](../modulos/consultas) e [`internacoes`](../modulos/internacoes)

A regra mais sensível do sistema. Vale para consultas **e** internações — por isso as duas herdam de `Atendimento`.

### O algoritmo

```
conflitaCom(outro) = this.getInicio() < outro.getFim()
                  && outro.getInicio() < this.getFim()
```

Dois intervalos se sobrepõem quando cada um começa antes do outro terminar. Um único método, herdado, cobre as duas subclasses.

| Garantia | Onde |
|---|---|
| `Atendimento.conflitaCom()` | Modelo |
| `AgendaValidator.validarConflitoDeHorario()` antes de gravar | Serviço |
| Verificação de que o horário cai em uma janela de `Disponibilidade` | Serviço |
| Índice único por profissional e intervalo | Banco |

**Exceção:** `ConflitoDeHorarioException` → `409`

**Cenários de teste:**

| Existente | Novo | Resultado |
|---|---|---|
| 14:00–14:30 | 14:00–14:30 | conflito |
| 14:00–14:30 | 14:15–14:45 | conflito |
| 14:00–14:30 | 13:45–14:15 | conflito |
| 14:00–14:30 | 14:30–15:00 | **sem** conflito (fim é exclusivo) |
| 14:00–14:30 | 13:00–14:00 | **sem** conflito |
| consulta 14:00–14:30 | internação 14:10 | conflito — a regra cruza os dois tipos |

---

## RN4 — Toda internação tem paciente e quarto disponível

**Dono:** [`internacoes`](../modulos/internacoes)

| Garantia | Onde |
|---|---|
| `paciente` e `quarto` obrigatórios | Modelo |
| `OcupacaoValidator.validarSituacao()` consulta `Quarto.estaDisponivel()` | Serviço |
| Um paciente não pode ter duas internações `ATIVA` | Serviço |

**Exceções:** `QuartoIndisponivelException` e `PacienteJaInternadoException` → `409`

**Cenário de teste:** internar em quarto `MANUTENCAO` é recusado; internar paciente que já está internado é recusado.

---

## RN5 — Um quarto nunca ultrapassa sua capacidade máxima

**Dono:** [`quartos`](../modulos/quartos)

| Garantia | Onde |
|---|---|
| `Quarto.ocupar()` recusa quando `getOcupacaoAtual() == capacidadeMaxima` | Modelo |
| `OcupacaoValidator.validarCapacidade()` antes da transação | Serviço |
| `atualizarSituacao()` recalcula a situação após cada ocupação e liberação | Modelo |

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
| Operações compostas rodam em transação — tudo ou nada | Serviço |
| Validação em quatro níveis: DTO, serviço, modelo e banco | Todas as camadas |
| Nenhuma regra implementada duas vezes | Fronteira de módulo |

**Cenário de teste:** se a atualização do quarto falhar durante uma internação, a internação não é criada.

---

## Rastreabilidade

| Regra | Módulo dono | Exceção | HTTP |
|---|---|---|---|
| RN1 | `pacientes` | — | — |
| RN2 | `consultas` | `DadosInvalidosException` | 400 |
| RN3 | `consultas`, `internacoes` | `ConflitoDeHorarioException` | 409 |
| RN4 | `internacoes` | `QuartoIndisponivelException` | 409 |
| RN5 | `quartos` | `CapacidadeExcedidaException` | 409 |
| RN6 | `historico` | — | — |
| RN7 | todos | `RegraDeNegocioException` | 409 |
