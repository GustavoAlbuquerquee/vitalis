# API

Contrato REST do Vitalis. Os módulos profissionais, quartos, internações e
procedimentos cirúrgicos estão implementados em memória; seus cadastros são
reiniciados quando a aplicação reinicia. A persistência será definida junto da
escolha de banco registrada no ADR 0002.

**Base:** `/api/v1`

## Convenções

| Assunto | Decisão |
|---|---|
| Formato | JSON, UTF-8 |
| Datas | ISO-8601 (`2026-03-14`, `2026-03-14T09:30:00`) |
| Paginação | `?page=0&size=20&sort=nome,asc` |
| Criação | `201` com `Location` apontando para o recurso |
| Mudança de estado | `PATCH` em sub-recurso (`/consultas/{id}/realizacao`), não `PUT` na raiz |
| Remoção lógica | `DELETE` desativa ou cancela; nada é apagado fisicamente |

## Pacientes

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/pacientes` | `201` · `409` se CPF duplicado |
| `GET` | `/pacientes/{id}` | `200` · `404` |
| `GET` | `/pacientes?nome=&cpf=` | `200` paginado |
| `PUT` | `/pacientes/{id}` | `200` · `404` |
| `DELETE` | `/pacientes/{id}` | `204` |
| `GET` | `/pacientes/{id}/historico` | `200` · `404` |

## Profissionais

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/profissionais` | `201` · `409` se registro duplicado |
| `GET` | `/profissionais/{id}` | `200` · `404` |
| `GET` | `/profissionais?especialidade=&tipo=` | `200` |
| `PUT` | `/profissionais/{id}` | `200` · `404` |
| `POST` | `/profissionais/{id}/disponibilidades` | `201` · `409` se sobrepõe janela existente |
| `POST` | `/profissionais/{id}/encaminhamentos` | `201` · clínico geral encaminha paciente |
| `GET` | `/profissionais/{id}/encaminhamentos` | `200` |
| `GET` | `/profissionais/{id}/agenda?data=` | `200` · janelas disponíveis na data |

`POST /profissionais` recebe `tipo` como `CLINICO_GERAL`, `ESPECIALISTA` ou
`CIRURGIAO`. Especialistas informam `especialidade`; cirurgiões informam
`areaCirurgica`. O registro é único independentemente de pontuação ou caixa.
As janelas usam `diaSemana`, `horaInicio` e `horaFim`, e intervalos sobrepostos
no mesmo dia são recusados. A agenda retorna essas janelas para a data
solicitada; consultas e internações serão agregadas quando seus módulos de API
forem implementados.

## Consultas

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/consultas` | `201` · `409` conflito de horário |
| `GET` | `/consultas/{id}` | `200` · `404` |
| `GET` | `/consultas?profissionalId=&pacienteId=&data=&status=` | `200` paginado |
| `PATCH` | `/consultas/{id}/reagendamento` | `200` · `409` |
| `PATCH` | `/consultas/{id}/realizacao` | `200` · `422` se já realizada |
| `DELETE` | `/consultas/{id}` | `204` — cancela, não apaga |

**Exemplo — agendar:**

```json
POST /api/v1/consultas
{
  "pacienteId": 42,
  "profissionalId": 7,
  "data": "2026-03-14",
  "horario": "09:30",
  "duracaoMinutos": 30,
  "motivo": "Dor torácica há três dias"
}
```

**Conflito de horário:**

```json
409 Conflict
{
  "timestamp": "2026-03-10T14:22:05",
  "status": 409,
  "codigo": "CONFLITO_DE_HORARIO",
  "mensagem": "O profissional já possui atendimento marcado neste horário",
  "caminho": "/api/v1/consultas",
  "detalhes": ["Consulta 318 ocupa o intervalo 09:15–09:45"]
}
```

## Internações

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/internacoes` | `201` · `409` quarto indisponível, capacidade excedida ou paciente já internado |
| `GET` | `/internacoes/{id}` | `200` · `404` |
| `GET` | `/internacoes?status=ATIVA&quartoId=` | `200` paginado |
| `PATCH` | `/internacoes/{id}/alta` | `200` · `422` data de alta inválida |
| `PATCH` | `/internacoes/{id}/transferencia` | `200` · `409` |

## Quartos

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/quartos` | `201` · `409` número duplicado |
| `GET` | `/quartos/{id}` | `200` · `404` |
| `GET` | `/quartos?situacao=&andar=&tipo=` | `200` paginado |
| `GET` | `/quartos/{id}/ocupacao` | `200` — ocupação atual e vagas |
| `PATCH` | `/quartos/{id}/situacao` | `200` · `409` se há paciente e tenta interditar |

O `tipo` do quarto é classificatório e não altera as regras de capacidade
(decisão registrada no ADR 0005). A resposta de quarto inclui ocupação, vagas e
situação calculadas a partir de internações ativas e bloqueios administrativos;
`situacao` não é um campo de entrada editável.

## Procedimentos cirúrgicos

| Método | Rota | Resposta |
|---|---|---|
| `POST` | `/procedimentos-cirurgicos` | `201` · `400` se o responsável não for cirurgião |
| `GET` | `/procedimentos-cirurgicos?cirurgiaoId=` | `200` |
| `GET` | `/procedimentos-cirurgicos/{id}` | `200` · `404` |
| `GET` | `/profissionais/{id}/procedimentos-cirurgicos` | `200` · procedimentos do cirurgião |
| `PATCH` | `/procedimentos-cirurgicos/{id}/inicio` | `200` |
| `PATCH` | `/procedimentos-cirurgicos/{id}/conclusao` | `200` · recebe `dataHoraConclusao`; `422` se não foi iniciado |
| `PATCH` | `/procedimentos-cirurgicos/{id}/cancelamento` | `200` · `422` se já concluído/cancelado |

O procedimento conserva as observações pré e pós-operatórias separadas. A data
efetiva fica nula até o início efetivo e o estado só pode seguir
`AGENDADO → EM_ANDAMENTO → CONCLUIDO`; pode ser cancelado enquanto agendado ou
em andamento.

## Histórico e registros clínicos

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/pacientes/{id}/historico?de=&ate=` | `200` · `404` |
| `POST` | `/atendimentos/{id}/registros` | `201` · `404` |
| `GET` | `/atendimentos/{id}/registros` | `200` |

## Formato de erro

Toda falha devolve o mesmo corpo, montado por `GlobalExceptionHandler`:

```json
{
  "timestamp": "2026-03-10T14:22:05",
  "status": 409,
  "codigo": "CAPACIDADE_EXCEDIDA",
  "mensagem": "O quarto 302 já atingiu a capacidade máxima de 2 pacientes",
  "caminho": "/api/v1/internacoes",
  "detalhes": []
}
```

| Código HTTP | Quando |
|---|---|
| `400` | Campo obrigatório ausente, formato inválido |
| `404` | Recurso não encontrado |
| `409` | Violação de regra de negócio (RN2–RN5, RN7) |
| `422` | Operação impossível para o estado atual do recurso |
| `500` | Falha não prevista — nunca deve vazar detalhe interno |
