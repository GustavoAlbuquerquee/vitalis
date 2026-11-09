# API

Contrato REST do Vitalis. Os módulos de pacientes, profissionais, consultas,
quartos, internações e procedimentos cirúrgicos estão implementados em memória;
seus cadastros são reiniciados quando a aplicação reinicia. A persistência será
definida junto da escolha de banco registrada no ADR 0002.

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
solicitada; consultas e procedimentos agendados também verificam conflitos de
horário. Internações mantêm referências tipadas ao paciente e ao profissional.

## Consultas — implementado na Sprint 2

Base: `/api/v1`. A listagem de consultas retorna um array (a paginação geral
continua prevista para integração futura).

| Método | Rota | Resposta |
|---|---|---|
| POST | /consultas | 201 + Location; 400 formato; 404 cadastro inexistente; 409 condição incompatível |
| GET | /consultas/{id} | 200; 404 |
| GET | /consultas?profissionalId=&pacienteId=&data=&status=&modalidade= | 200 |
| PATCH | /consultas/{id}/confirmacao | 200; 409 transição inválida |
| PATCH | /consultas/{id}/inicio | 200; 409 |
| PATCH | /consultas/{id}/conclusao | 200; 409 |
| PATCH | /consultas/{id}/nao-comparecimento | 200; 409 |
| PATCH | /consultas/{id}/observacoes | 200; 409 se ainda não concluída |
| DELETE | /consultas/{id} | 204; 409 se estado final — cancela sem excluir |

Conclusão e observações recebem `{"observacoes": "Avaliação registrada"}`.
A conclusão aceita `{}` quando não há observações.

Exemplo de rotina (especializada acrescenta `especialidade`, compatível com o profissional):

```json
{
  "modalidade": "ROTINA",
  "pacienteId": 1,
  "profissionalId": 1,
  "data": "2030-01-07",
  "horario": "10:00",
  "duracaoMinutos": 30,
  "motivo": "Avaliação de rotina"
}
```

Modalidades: ROTINA, ESPECIALIZADA, EMERGENCIA. Os seis estados da consulta são
AGENDADA, CONFIRMADA, EM_ATENDIMENTO, CONCLUIDA, CANCELADA e NAO_COMPARECEU.
Datas passadas, durações fora de 1–1440 minutos e campos incompatíveis com a
modalidade retornam 400. Disponibilidade, especialidade e conflito retornam 409.

### Emergências e fila

```json
{
  "modalidade": "EMERGENCIA",
  "pacienteId": 1,
  "profissionalId": 1,
  "motivo": "Avaliação imediata",
  "prioridade": "ALTA"
}
```

A prioridade é obrigatória: BAIXA, MODERADA, ALTA ou CRITICA. A chegada vem do
relógio do servidor. Não envie data, horário, duração, especialidade, status ou
chegada. Campos desconhecidos e enums numéricos são rejeitados com 400.

- `GET /consultas?modalidade=EMERGENCIA&status=AGUARDANDO`
- `GET /consultas?modalidade=EMERGENCIA&status=EM_ATENDIMENTO`
- `GET /consultas?modalidade=EMERGENCIA&status=CONCLUIDA`

A ordenação é por prioridade decrescente, chegada crescente e ID crescente.
A resposta inclui `prioridade`, `chegada`, `iniciadoEm` e `concluidoEm`.
A emergência já tem presença confirmada ao chegar, representada como AGUARDANDO
na API; inicie diretamente com PATCH /consultas/{id}/inicio. Não há confirmação
manual nem não comparecimento. Conclusão e cancelamento usam as mesmas rotas das
consultas. `AGUARDANDO` exige modalidade EMERGENCIA no filtro.

### Executar sem os cadastros da Trilha A

`mvn spring-boot:run -Dspring-boot.run.profiles=demo`

O perfil `demo` fornece paciente 1 e cardiologista 1 fictícios, disponível todos
os dias das 08:00 às 18:00. Use uma data futura no exemplo. Fora desse perfil, os módulos de cadastro reais fornecem os pacientes e
profissionais; o erro 503 `CADASTRO_INDISPONIVEL` só é usado se a integração de
cadastro de profissionais estiver ausente.

O repositório atual é em memória: reiniciar perde os registros. A interface permite
integrar o banco após a decisão do grupo. Veja [ADR 0007](decisoes/0007-adaptador-temporario-de-consultas.md).
O frontend da Sprint 1 ainda usa dados locais e requer integração posterior com esta API.

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
(decisão registrada no ADR 0008). A resposta de quarto inclui ocupação, vagas e
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
| `422` | Reservado para contratos futuros; transição inválida de consulta usa 409 |
| `500` | Falha não prevista — nunca deve vazar detalhe interno |
