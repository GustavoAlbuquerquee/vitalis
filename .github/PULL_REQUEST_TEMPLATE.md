## O que muda

<!-- Uma ou duas frases. O que este PR faz. -->

## Por quê

<!-- O problema que resolve, ou a issue que fecha. -->

Closes #

## Como testar

<!-- Passo a passo para o revisor conferir. -->

1.
2.

## Módulos tocados

- [ ] `comum`
- [ ] `pacientes`
- [ ] `profissionais`
- [ ] `consultas`
- [ ] `internacoes`
- [ ] `quartos`
- [ ] `historico`
- [ ] documentação

## Checklist

- [ ] A regra de negócio está no módulo dono dela
- [ ] Nenhum módulo acessa o repositório de outro
- [ ] A camada foi respeitada (controller não consulta banco, model não conhece framework)
- [ ] Cenário de fronteira testado, não só o caminho feliz
- [ ] `docs/regras-de-negocio.md` atualizado, se alguma regra mudou
- [ ] Diagrama de classes atualizado, se o domínio mudou
- [ ] ADR registrada, se foi uma decisão arquitetural
