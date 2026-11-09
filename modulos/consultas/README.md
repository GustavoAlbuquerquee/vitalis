# Módulo consultas — Sprint 2

Implementa as issues #8, #9 e #10 sobre a base compartilhada da #6.

## Modelo

- ConsultaRotina e ConsultaEspecializada herdam de ConsultaAgendada, que centraliza
  intervalo e validação de disponibilidade/conflito. Especializada também valida a área.
- AtendimentoEmergencia exige prioridade, registra chegada e dispensa agenda.
- Consulta reúne motivo e ciclo de seis estados; Atendimento reúne paciente,
  profissional, observações, criação e o único algoritmo de conflito.
- EstadoTransicionavel e Transicoes são compartilhados em comum.model.

## Estados

| De | Destinos |
|---|---|
| AGENDADA | CONFIRMADA, CANCELADA, NAO_COMPARECEU |
| CONFIRMADA | EM_ATENDIMENTO, CANCELADA, NAO_COMPARECEU |
| EM_ATENDIMENTO | CONCLUIDA, CANCELADA |
| CONCLUIDA, CANCELADA, NAO_COMPARECEU | Nenhum |

A emergência confirma a presença na chegada; a API projeta essa espera como
AGUARDANDO e permite iniciar diretamente. Prioridade maior vem primeiro, seguida
por chegada mais antiga e ID menor em empate exato. Cancelar preserva o registro.

## API e integração

O [contrato HTTP](../../docs/api.md#consultas--implementado-na-sprint-2) documenta
criação, busca, filtros, confirmação, início, conclusão, falta, observações e cancelamento.

Consultas acessam os cadastros por PacienteService e ProfissionalService, nunca
pelos repositórios. A [integração da Trilha B](../../docs/integracao-trilha-b.md)
descreve o suporte mínimo ainda pendente dos cadastros completos.

A agenda cruza modalidades por FonteAgenda. Os módulos de cirurgia/internação
precisam fornecer essa interface para que seus horários entrem na comparação.

O adaptador atual é em memória e perde os registros no reinício. O perfil demo
fornece cadastros fictícios para experimentação; não é uma entrega de persistência.
Veja a [ADR 0007](../../docs/decisoes/0007-adaptador-temporario-de-consultas.md).

## Testes

Execute `mvn test`. Há cobertura das validações, 36 combinações de estado,
conflitos entre modalidades, cancelamento sem exclusão, criação concorrente,
ordenação da fila e filtros por situação da emergência.
