# Integração da Trilha B

O backend de `main` ainda não possui os cadastros da Trilha A. Esta entrega inclui
somente o núcleo de `Paciente`, `ProfissionalSaude`, `ClinicoGeral`, `Especialista`
e `Disponibilidade` necessário para compilar e validar consultas. Não implementa
os endpoints nem todas as regras de cadastro (CPF, endereço, unicidade etc.).

`PacienteService.buscarPorId` e `ProfissionalService.buscarPorId` são as fronteiras
de leitura a implementar pelo cadastro. Consultas nunca acessam os repositórios
desses módulos. Os testes fornecem implementações controladas dessas interfaces.
