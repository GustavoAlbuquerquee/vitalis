# Como contribuir

O combinado do time. Serve para o trabalho render sem ninguém pisar no pé do outro.

## O fluxo

1. **Abra uma issue** descrevendo o que vai fazer, usando o template
2. **Crie um branch** a partir de `main`
3. **Faça commits pequenos**, no padrão abaixo
4. **Abra o pull request** com o template preenchido
5. **Peça revisão** a alguém do time
6. **Merge** só depois de uma aprovação

`main` está sempre íntegra. Ninguém commita direto nela.

## Branches

```
<tipo>/<descricao-curta>
```

| Tipo | Quando |
|---|---|
| `feat/` | Funcionalidade nova |
| `fix/` | Correção |
| `docs/` | Só documentação |
| `refactor/` | Muda a estrutura sem mudar comportamento |
| `test/` | Só testes |

Exemplos: `feat/agendamento-de-consulta`, `fix/conflito-horario-borda`, `docs/adr-banco-de-dados`

## Commits

Padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o módulo entre parênteses:

```
<tipo>(<modulo>): <o que mudou, no imperativo>
```

```
feat(consultas): valida conflito de horário no agendamento
fix(quartos): corrige contagem de ocupação após transferência
docs(decisoes): registra ADR da escolha do banco
test(internacoes): cobre alta com data anterior à entrada
refactor(comum): extrai formato de erro para ErroResponse
```

Mensagem no imperativo, em português, sem ponto final. Se precisar explicar o porquê, use o corpo do commit — a primeira linha diz *o quê*.

## Pull request

- Título com o mesmo padrão do commit
- Descrição respondendo: **o que muda**, **por que**, **como testar**
- Marque a issue que o PR fecha (`Closes #12`)
- PR pequeno é revisado no mesmo dia; PR de 40 arquivos fica parado a semana toda

## Regras que não se quebram

| Regra | Por quê |
|---|---|
| **Mudou regra de negócio? Atualize [docs/regras-de-negocio.md](docs/regras-de-negocio.md) no mesmo PR** | Documentação desatualizada mente |
| **Mudou o domínio? Atualize o [diagrama de classes](docs/diagrama-de-classes.md)** | O diagrama é a referência do time |
| **Decisão arquitetural vira [ADR](docs/decisoes)** | Daqui a dois meses ninguém lembra o motivo |
| **Regra de negócio nova vem com teste** | Inclusive o cenário de fronteira, não só o caminho feliz |
| **Respeite a fronteira do módulo** | Nenhum módulo acessa o repositório de outro |
| **Nada é apagado fisicamente** | A RN6 depende disso |

## Onde colocar cada coisa

| Se você está escrevendo… | Vai em |
|---|---|
| Validação de formato de campo | `dto/` do módulo |
| Decisão do tipo "pode ou não pode" | `service/` do módulo |
| Comportamento do próprio objeto | `model/` do módulo |
| Busca no banco | `repository/` do módulo |
| Algo que dois módulos precisam | `modulos/comum/` |

Em dúvida sobre o módulo? O dono da regra está na tabela de [regras-de-negocio.md](docs/regras-de-negocio.md).

## Revisão de código

Quem revisa procura, nesta ordem:

1. A regra de negócio está no módulo certo?
2. A camada está respeitada — nenhuma consulta ao banco dentro do controller?
3. O cenário de fronteira está testado?
4. A documentação acompanhou a mudança?

Comentário de revisão é sobre o código, nunca sobre quem escreveu.
