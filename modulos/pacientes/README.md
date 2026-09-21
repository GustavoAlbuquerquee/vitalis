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

## Dependências

`comum`

## O que **não** pertence aqui

- Agendar consulta — é do módulo [`consultas`](../consultas)
- Internar paciente — é do módulo [`internacoes`](../internacoes)
- Montar o histórico médico — é do módulo [`historico`](../historico)
