# ADR 0007 — Adaptador temporário de consultas

**Status:** temporária, para desenvolvimento da Trilha B.

A ADR 0002 deixa a escolha do banco pendente. `ConsultaRepository` é uma interface;
`ConsultaRepositoryMemoria` mantém os registros apenas durante o processo. Reiniciar
a aplicação perde esses dados. Não substitui a persistência durável da entrega final.

Validação de agenda, inserção e mudanças de estado usam o mesmo monitor de
`AgendaService`, evitando duas reservas concorrentes nesta instância. Os futuros
serviços de cirurgia/internação devem publicar `FonteAgenda` e usar a mesma seção
crítica ao reservar horários. Com banco e múltiplas instâncias, será necessário
substituir o monitor por uma garantia transacional entre módulos.

`PacienteService` e `ProfissionalService` definem as consultas ao cadastro da Trilha A.
Sem implementações, o POST retorna 503 `CADASTRO_INDISPONIVEL`. O perfil explícito
`demo` fornece um paciente e um cardiologista fictícios (ID 1), para testar o fluxo.
Esses dados não são carregados no perfil normal. Os DTOs de resposta não expõem
CPF, registro profissional nem as entidades de cadastro.

O relógio é injetável, usando America/Sao_Paulo no aplicativo e instante fixo nos
testes. Os horários JSON são locais, sem offset, conforme o contrato original.
