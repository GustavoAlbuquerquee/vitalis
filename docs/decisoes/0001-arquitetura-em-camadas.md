# ADR 0001 — Arquitetura modular em camadas

**Status:** aceita
**Data:** 2026-09-21

## Contexto

O sistema precisa atender sete regras de negócio que se cruzam entre domínios diferentes: a regra de conflito de horário envolve consultas, internações e disponibilidade de profissionais; a regra de capacidade envolve quartos e internações.

Sem uma estrutura definida desde o início, essas regras acabam espalhadas — um pedaço no controller, outro numa consulta SQL, outro numa validação de tela. Quando a regra muda, ninguém sabe quantos lugares precisam mudar junto.

A disciplina é Programação Modular. A estrutura é o entregável principal, não um detalhe.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| **Pacote único por tipo** (`controllers/`, `services/`, `models/`) | Funciona em projeto pequeno, mas não expressa fronteira de domínio. Com sete domínios, a pasta `services/` vira um depósito e nada impede `ConsultaService` de mexer direto no repositório de quartos. |
| **Arquitetura hexagonal completa** (portas e adaptadores) | Resolveria o mesmo problema com mais rigor, mas o custo de ports, adapters e inversão de dependência em todo lugar não se paga num projeto deste tamanho e prazo. |
| **Monólito sem camadas, com a regra no controller** | Mais rápido de escrever nas primeiras semanas. Impossível de testar sem subir a aplicação e garantia de regra duplicada na terceira funcionalidade. |

## Decisão

Duas dimensões:

1. **Modular por domínio** — sete módulos em `modulos/`, cada um dono de um pedaço do hospital
2. **Estratificado em camadas** dentro de cada módulo — controller, service, repository, model

Com quatro regras de fronteira:

- O grafo de dependências entre módulos é acíclico
- Um módulo nunca acessa o repositório de outro; conversa pela camada de serviço
- Cada regra de negócio tem um módulo dono e vive só nele
- O módulo `comum` não depende de nenhum outro

## Consequências

**O que ganhamos**

- Regra de negócio testável sem servidor, sem banco e sem mock — o `model` não conhece framework
- Localização óbvia: toda mudança tem um lugar previsível
- Divisão de trabalho natural entre os integrantes, um módulo por vez, com pouco conflito de merge
- Trocar o banco não toca em nenhuma regra de negócio

**O que aceitamos conviver**

- Mais arquivos e mais indireção que a solução ingênua — um CRUD simples atravessa quatro camadas
- DTO e entidade separados significam código de conversão a escrever (mitigado com mapper)
- A fronteira entre módulos precisa de disciplina: é uma convenção revisada em code review, não algo que o compilador impede
