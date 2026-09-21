# Testes

Três níveis, cada um respondendo a uma pergunta diferente.

| Diretório | Pergunta que responde | Depende de |
|---|---|---|
| [`unitarios/`](unitarios) | A regra de negócio está certa? | Nada — sem banco, sem servidor |
| [`integracao/`](integracao) | O módulo conversa direito com o banco? | Banco de teste |
| [`e2e/`](e2e) | O fluxo completo funciona pela API? | Aplicação no ar |

## Unitários

O alvo é o `model` e o `service`. São os testes que mais importam neste projeto, porque é onde as sete regras vivem.

Como o `model` não conhece framework nem persistência, esses testes rodam em milissegundos e não precisam de infraestrutura nenhuma.

**Cobertura mínima — um teste por cenário:**

| Regra | Cenários |
|---|---|
| RN3 | sobreposição total, parcial no início, parcial no fim, encostado sem sobrepor, consulta contra internação |
| RN4 | quarto em manutenção, quarto lotado, paciente já internado |
| RN5 | ocupar até o limite, ultrapassar o limite, liberar e reocupar |
| RN6 | consulta cancelada continua no histórico, internação com alta continua no histórico |
| — | alta com data anterior à entrada, disponibilidades sobrepostas, CPF duplicado |

## Integração

O alvo é o `repository` e a transação. Verificam o que o unitário não alcança:

- A consulta de conflito da RN3 encontra atendimentos das duas tabelas
- O índice único realmente impede CPF duplicado
- A internação é atômica: se a atualização do quarto falhar, a internação não é criada

Rodam contra um banco de teste descartável, recriado a cada execução.

## Ponta a ponta

O alvo é o contrato da API. Poucos, cobrindo os fluxos que o hospital usa todo dia:

1. Cadastrar paciente → agendar consulta → realizar → conferir no histórico
2. Cadastrar quarto → internar → transferir → dar alta → conferir a situação do quarto
3. Agendar dois atendimentos no mesmo horário → receber `409` com o código `CONFLITO_DE_HORARIO`

## Convenção de nomes

```
deve<ComportamentoEsperado>Quando<Condicao>
```

Exemplos:

```
deveRecusarAgendamentoQuandoProfissionalJaTemAtendimentoNoHorario
deveRecusarInternacaoQuandoQuartoAtingiuCapacidadeMaxima
deveManterConsultaNoHistoricoQuandoCancelada
devePermitirAgendamentoQuandoIntervaloApenasEncosta
```

O nome do teste é a documentação da regra. Se ele não descreve o comportamento, está mal nomeado.

## Regra do time

Toda regra de negócio nova entra acompanhada do teste que a prova — e do cenário de fronteira que quase a quebra. Teste que só cobre o caminho feliz não prova nada: o bug mora na borda.
