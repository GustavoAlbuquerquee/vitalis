# ADR 0005 — Base compartilhada de atendimentos

Implementação da issue #6: `Pessoa`, `Atendimento`, `EstadoTransicionavel` e
`Transicoes` ficam em `comum.model`. `Atendimento<P extends Pessoa, R extends Pessoa>`
preserva os tipos de paciente e profissional definidos pelas subclasses sem fazer
`comum` importar os módulos de cadastro. O método final `conflitaCom` compara
intervalos semiabertos: dois atendimentos que apenas encostam não conflitam.

Cada modalidade fornece `getInicio`, `getFim` e `validarCondicoes`. A infraestrutura
de transição é compartilhada; cada enum define suas transições permitidas, e o
modelo só troca o estado após a validação. Não há setters públicos de estado.

Esta implementação complementa a ADR 0003: a assinatura de validação exigida na
Sprint 2 é abstrata. `getResumo` permanece uma previsão do diagrama da Sprint 1.
