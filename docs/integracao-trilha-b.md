# Integração da Trilha B — histórico e estado atual

Este documento registra a integração inicial da Trilha B e o estado atual do
projeto após a implementação das issues #11, #12 e #13.

## Integração inicial (PR #14)

Naquele momento, o backend ainda não possuía os cadastros da Trilha A e a entrega
incluiu somente o núcleo necessário para compilar e validar consultas.
`PacienteAtendimentoService` e `ProfissionalService` mantiveram-se como fronteiras
de leitura; consultas não acessam diretamente os repositórios desses módulos.

## Compatibilidade com o diagrama da Sprint 2

O PR #14 foi integrado antes destas demandas. Sua ADR 0005 continua uma proposta.
A base entregue usa `EstadoTransicionavel` nos enums e `Transicoes` como validador;
consumidores devem usar essas assinaturas ou adaptar a interface proposta antes
de implementar novas máquinas. Não há um método público para atribuir status.

## Estado atual

Os cadastros de pacientes e profissionais e as APIs de consultas, quartos,
internações e procedimentos cirúrgicos estão integrados. Profissional especialidade
fica na classe `Especialista`, internações e cirurgias mantêm objetos tipados de
paciente e profissional, e a agenda compartilha conflitos entre consultas e
procedimentos. Consulte os módulos correspondentes e [as regras de negócio](regras-de-negocio.md).
