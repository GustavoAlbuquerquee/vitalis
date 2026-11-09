# Integração da Trilha B

O backend de `main` ainda não possui os cadastros da Trilha A. Esta entrega inclui
somente o núcleo de `Paciente`, `ProfissionalSaude`, `ClinicoGeral`, `Especialista`
e `Disponibilidade` necessário para compilar e validar consultas. Não implementa
os endpoints nem todas as regras de cadastro (CPF, endereço, unicidade etc.).

`PacienteService.buscarPorId` e `ProfissionalService.buscarPorId` são as fronteiras
de leitura a implementar pelo cadastro. Consultas nunca acessam os repositórios
desses módulos. Os testes fornecem implementações controladas dessas interfaces.

## Compatibilidade com o diagrama da Sprint 2

O PR #14 foi integrado durante esta entrega. Sua ADR 0005 continua uma proposta.
A base entregue usa EstadoTransicionavel nos enums e Transicoes como validador;
consumidores devem usar essas assinaturas ou adaptar a interface proposta antes
de implementar novas máquinas. Não há um método público para atribuir status.

O suporte mínimo aos profissionais ainda não implementa podeRealizar, encaminhar
ou a categoria Cirurgiao. A regra de compatibilidade da consulta especializada usa
a Especialidade do profissional; o cadastro completo deve completar as atribuições
polimórficas. ConsultaService depende somente das interfaces públicas dos cadastros.
