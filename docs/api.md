# API

Contrato REST previsto. Ainda não implementado — este documento é o alvo.

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
| `GET` | `/profissionais?especialidade=` | `200` paginado |
| `PUT` | `/profissionais/{id}` | `200` · `404` |
| `POST` | `/profissionais/{id}/disponibilidades` | `201` · `409` se sobrepõe janela existente |
| `GET` | `/profissionais/{id}/agenda?data=` | `200` |

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
