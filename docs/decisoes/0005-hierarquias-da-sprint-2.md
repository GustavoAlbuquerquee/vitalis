# ADR 0005 — Hierarquias e máquinas de estado da Sprint 2

**Status:** proposta — precisa do aceite de Enzo e Armando antes das issues [#8](https://github.com/GustavoAlbuquerquee/vitalis/issues/8) e [#11](https://github.com/GustavoAlbuquerquee/vitalis/issues/11) começarem
**Data:** 2026-10-26
**Substitui parcialmente:** [ADR 0003](0003-atendimento-como-superclasse.md)

## Contexto

O enunciado da Sprint 2 introduz três categorias de profissional, quatro modalidades de atendimento e uma máquina de seis estados para a consulta. E diz, nominalmente, duas coisas que determinam a modelagem:

> *"O sistema deverá representar essas características sem duplicar desnecessariamente os atributos e comportamentos comuns."*

> *"Cada modalidade deverá implementar sua própria lógica de validação das condições necessárias."*

Este ADR registra as cinco decisões que o diagrama da Sprint 2 toma, para que as trilhas trabalhem em paralelo sobre o mesmo acordo.

---

## Decisão 1 — `Consulta` abstrata entre `Atendimento` e as três modalidades

### Alternativas

| Alternativa | Por que não |
|---|---|
| As quatro modalidades herdando direto de `Atendimento` | `ConsultaRotina`, `ConsultaEspecializada` e `AtendimentoEmergencia` repetiriam `data`, `horario`, `duracaoMinutos`, `observacoesMedicas`, `status` **e a máquina de seis estados inteira**. Três cópias de uma regra só. |
| `AtendimentoEmergencia` herdando de `Atendimento`, as duas consultas de `Consulta` | Evita o incômodo semântico, mas duplica status, observações e a máquina de estados entre `Consulta` e emergência. Troca três cópias por duas. |

### Decisão

`Atendimento` → `Consulta` (abstrata) → `ConsultaRotina`, `ConsultaEspecializada`, `AtendimentoEmergencia`.

`ProcedimentoCirurgico` e `Internacao` herdam direto de `Atendimento`.

### Consequências

**Ganhamos** uma única implementação da máquina de seis estados, e o histórico médico vira uma lista polimórfica de `Atendimento` ordenável por `getInicio()`.

**Aceitamos** que `AtendimentoEmergencia` herde `data` e `horario`, que nele significam *quando aconteceu* e não *quando foi marcado*. Ele sobrescreve `ocupaAgenda()` devolvendo `false` — é assim que escapa da verificação de conflito de horário, que não faz sentido para quem chega sem agendamento.

> **Este é o ponto mais contestável do modelo.** Se o grupo preferir a segunda alternativa, muda aqui antes de qualquer código existir.

---

## Decisão 2 — `validarCondicoes()` abstrato em `Atendimento`

Método abstrato declarado na raiz, sobrescrito em cada uma das cinco classes concretas:

| Classe | O que valida |
|---|---|
| `ConsultaRotina` | Profissional livre no horário, dentro da disponibilidade |
| `ConsultaEspecializada` | Tudo da rotina **mais** especialidade compatível |
| `AtendimentoEmergencia` | Nada de agenda — é imediato por natureza |
| `ProcedimentoCirurgico` | Responsável é `Cirurgiao` e está habilitado para o tipo |
| `Internacao` | Quarto disponível, com vaga, paciente sem internação ativa |

**Regra de bolso para quem implementa:** se você copiar o mesmo `if` para duas classes, ele pertence à superclasse.

---

## Decisão 3 — `EstadoTransicionavel<E>` no módulo `comum`

Três entidades têm máquina de estados: consulta (6 estados), procedimento cirúrgico (4) e internação (4). São o mesmo padrão — estado atual, conjunto de transições válidas, exceção quando se tenta o que não vale.

### Decisão

Uma interface genérica em `comum`:

```java
interface EstadoTransicionavel<E extends Enum<E>> {
    E getEstado();
    Set<E> transicoesValidasDe(E atual);
    default boolean podeTransitarPara(E novo) { ... }
    default void transitarPara(E novo) { ... }  // lança TransicaoInvalidaException
}
```

Quem implementa declara **apenas** o mapa de transições permitidas. A validação e o lançamento da exceção ficam num lugar só.

### Consequências

Nenhuma das três entidades reimplementa a verificação. Em compensação, a interface precisa existir **antes** das trilhas B e C começarem — por isso ela está na [#6](https://github.com/GustavoAlbuquerquee/vitalis/issues/6), na Fase 0.

---

## Decisão 4 — `podeRealizar(Atendimento)` polimórfico

### Alternativa recusada

O serviço perguntando o tipo: *"este profissional é um `Especialista`? a especialidade bate? ah, mas se for cirurgia preciso checar se é `Cirurgiao`…"*. Isso espalha `instanceof` pela camada de serviço e cresce a cada categoria nova.

### Decisão

`ProfissionalSaude.podeRealizar(Atendimento)` abstrato. Cada categoria responde por si:

- `ClinicoGeral` — aceita consulta de rotina; recusa especializada e cirurgia
- `Especialista` — aceita rotina e especializada **da sua área**
- `Cirurgiao` — aceita procedimento cirúrgico do tipo para o qual está habilitado

O serviço pergunta uma coisa só e não sabe quantas categorias existem.

---

## Decisão 5 — `Encaminhamento` como entidade

> *"Pode encaminhar pacientes para atendimento especializado."*

Encaminhar não é chamar um método e esquecer: é um registro que alguém consulta depois para marcar a consulta especializada. Vira entidade com `origem`, `paciente`, `especialidadeDestino`, `motivo`, `emitidoEm` e `atendido`.

**O custo:** mais uma tabela e mais um endpoint. **O ganho:** a atribuição do clínico geral que o enunciado descreve deixa de ser um comentário no código e passa a ser verificável.

---

## O que continua valendo da Sprint 1

O [ADR 0003](0003-atendimento-como-superclasse.md) argumentava que `Atendimento` deveria ser abstrata porque a RN3 — *um profissional não pode ter dois atendimentos no mesmo horário* — vale para consultas e internações.

**Continua certo, e ficou mais forte:** agora são cinco classes concretas sob `Atendimento`, e `conflitaCom()` segue implementado uma única vez. O único ajuste é `ocupaAgenda()`, que permite a emergência ficar de fora da verificação.

---

## Pendências que este ADR não resolve

| # | Questão | Onde |
|---|---|---|
| 1 | A tabela de transições da consulta é proposta, não fechada — o enunciado dá exemplos | [#9](https://github.com/GustavoAlbuquerquee/vitalis/issues/9) |
| 2 | "Tipos de quartos" aparece nas entregas sem nenhuma regra descrita | [#12](https://github.com/GustavoAlbuquerquee/vitalis/issues/12) |
| 3 | Os valores de `TipoCirurgia` são suposição — o enunciado só diz "tipo de cirurgia" | [#13](https://github.com/GustavoAlbuquerquee/vitalis/issues/13) |
| 4 | O banco continua indefinido ([ADR 0002](0002-escolha-do-banco.md)); a Sprint 2 cobra domínio e API, não persistência | — |
