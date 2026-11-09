# Módulo `pacientes`

Quem é atendido pelo hospital.

## Responsabilidade

Manter o cadastro dos pacientes: identificação, contato e endereço. É a porta de entrada de qualquer atendimento — nenhuma consulta ou internação existe sem um paciente cadastrado.

## Entidades

| Entidade | Atributos principais |
|---|---|
| `Paciente` (herda de `Pessoa`) | `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `endereco` |
| `Pessoa` *(abstrata)* | `nome`, `telefone`, `email`, `ativo` |
| `Endereco` *(objeto de valor, vindo de `comum`)* | `logradouro`, `numero`, `bairro`, `cidade`, `uf`, `cep` |

`Paciente` implementa `getIdentificacaoPrincipal()` devolvendo o CPF — é a especialização que diferencia um paciente de um profissional.

## Regras que este módulo garante

| # | Regra |
|---|---|
| **RN1** | Um paciente pode ter várias consultas e internações ao longo do tempo |
| — | O CPF é único: não existem dois cadastros para a mesma pessoa |
| — | Um paciente nunca é excluído fisicamente — é desativado, para preservar o histórico (apoia a **RN6**) |

## Endpoints previstos

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/pacientes` | Cadastra um paciente |
| `GET` | `/pacientes/{id}` | Busca por identificador |
| `GET` | `/pacientes?nome=&cpf=` | Lista com filtro e paginação |
| `PUT` | `/pacientes/{id}` | Atualiza o cadastro |
| `DELETE` | `/pacientes/{id}` | Desativa o paciente |
| `GET` | `/pacientes/{id}/historico` | Delega para o módulo [`historico`](../historico) |

## Estado da implementação

Implementado na [#7](https://github.com/GustavoAlbuquerquee/vitalis/issues/7).

| Camada | Classe |
|---|---|
| `model` | `Paciente` — estende `Pessoa`, do `comum` |
| `repository` | `PacienteRepository` (interface) e `PacienteRepositoryEmMemoria` |
| `service` | `PacienteService` |
| `controller` | `PacienteController` |
| `dto` | `PacienteRequest`, `PacienteResponse`, `EnderecoDTO`, `PaginaResponse` |

O repositório é uma interface de propósito: a Sprint 2 cobra domínio e API, não
persistência. Trocar a implementação em memória por JPA na Sprint 3 não toca em
nenhuma regra de negócio, porque o serviço só conhece o contrato.

`PaginaResponse` foi escrita à mão porque o projeto ainda não tem Spring Data.
Quando tiver, vira `Page<T>` e o formato da resposta não muda.

### Ainda não implementado

`estaInternado()` aparece no diagrama mas não existe na classe. Saber se um
paciente está internado exige consultar as internações, e a regra de fronteira
do projeto proíbe este módulo de acessar o repositório de outro. A integração
acontece na camada de serviço quando [#12](https://github.com/GustavoAlbuquerquee/vitalis/issues/12) existir — não no modelo.

## Dependências

`comum`

## O que **não** pertence aqui

- Agendar consulta — é do módulo [`consultas`](../consultas)
- Internar paciente — é do módulo [`internacoes`](../internacoes)
- Montar o histórico médico — é do módulo [`historico`](../historico)
