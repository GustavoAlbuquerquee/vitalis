# Glossário

O vocabulário do hospital. Uma palavra, um significado — no código, na documentação e na conversa do time.

| Termo | Significado no Vitalis |
|---|---|
| **Atendimento** | Qualquer encontro entre paciente e profissional. Superclasse abstrata de consulta e internação. Não existe "um atendimento" solto no banco — existe uma consulta ou uma internação. |
| **Consulta** | Atendimento ambulatorial, com data e horário marcados. O paciente vem, é atendido e vai embora. |
| **Internação** | Atendimento com permanência. O paciente ocupa um leito por um período. |
| **Alta** | Encerramento da internação. **Prevista** é a data estimada no momento da entrada; **efetiva** é quando aconteceu de verdade. |
| **Quarto** | Unidade física com capacidade para um ou mais pacientes. Chamamos de quarto, não de leito — a capacidade é do quarto. |
| **Capacidade máxima** | Quantos pacientes cabem no quarto ao mesmo tempo. Limite rígido (RN5). |
| **Ocupação atual** | Quantas internações `ATIVA` existem naquele quarto agora. Calculada, nunca digitada. |
| **Situação do quarto** | `DISPONIVEL`, `OCUPADO`, `MANUTENCAO` ou `INTERDITADO`. As duas primeiras são derivadas da ocupação; as duas últimas são decisão administrativa. |
| **Disponibilidade** | Janela de horário em que um profissional atende, por dia da semana. Diz *quando ele pode*, não *o que já está marcado*. |
| **Conflito de horário** | Dois atendimentos do mesmo profissional cujos intervalos se sobrepõem. Proibido pela RN3. |
| **Registro clínico** | Anotação feita durante um atendimento: anamnese, diagnóstico, prescrição, exame ou evolução. Informação original, sempre com autor e data. |
| **Histórico médico** | Visão consolidada de tudo que já aconteceu com um paciente. Derivado, nunca armazenado. |
| **Registro profissional** | Número do conselho de classe — CRM, COREN, CREFITO. Identifica o profissional como o CPF identifica o paciente. |
| **Especialidade** | Área de atuação do profissional. Enumeração fechada, não texto livre. |

## Termos de arquitetura

| Termo | Significado |
|---|---|
| **Módulo** | Diretório em [`modulos/`](../modulos) dono de um domínio, com suas próprias camadas. |
| **Camada** | Controller, Service, Repository ou Model. Fronteira de responsabilidade dentro do módulo. |
| **Entidade** | Objeto de domínio com identidade própria e ciclo de vida. Tem `id`. |
| **Objeto de valor** | Objeto sem identidade, definido pelos seus atributos. `Endereco` é o exemplo. |
| **DTO** | Contrato de entrada ou saída da API. Nunca é a entidade. |
| **Derivado** | Calculado a partir de outros dados, nunca gravado. Situação do quarto e histórico médico são derivados. |
| **ADR** | *Architecture Decision Record* — registro de uma decisão arquitetural, com alternativas e consequências. Ficam em [`docs/decisoes`](decisoes). |

## Palavras que evitamos

| Não usamos | Usamos | Por quê |
|---|---|---|
| "médico" | **profissional da saúde** | O sistema atende enfermagem, fisioterapia e outras áreas |
| "leito" | **quarto** | A capacidade é modelada no quarto, não em leitos individuais |
| "cliente" | **paciente** | O vocabulário do domínio é clínico, não comercial |
| "deletar" | **desativar** ou **cancelar** | Nada é apagado fisicamente — a RN6 depende disso |
| "marcar" | **agendar** | Um verbo só para a mesma operação |
