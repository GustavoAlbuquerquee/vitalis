# Vitalis — front-end

Interface do Vitalis em **React 19 + TypeScript + Vite + Tailwind CSS 4**.

> **Estado atual: protótipo navegável, sem back-end.** Todas as telas funcionam com dados de exemplo gerados em memória. Formulários validam as regras de negócio, mas nada é gravado — ao enviar, um aviso informa que é um protótipo.

## Rodando

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # checagem de tipos + build de produção em dist/
```

Requer Node 20 ou superior.

## Telas

| Rota | Tela |
|---|---|
| `/` | Painel do dia: consultas, internações, ocupação, altas previstas |
| `/consultas` | Agenda — grade profissionais × horários, ou lista |
| `/consultas/nova` | Agendar consulta, com verificação ao vivo de RN2, RN3 e RF7 |
| `/consultas/:id` | Consulta: realizar, reagendar, cancelar, registrar falta |
| `/internacoes` | Internações por status |
| `/internacoes/nova` | Nova internação, com escolha visual do quarto (RN4, RN5) |
| `/internacoes/:id` | Internação: registros clínicos, alta, transferência |
| `/quartos` | Mapa de ocupação por andar |
| `/quartos/:id` | Quarto: vagas, ocupantes, histórico de ocupação |
| `/pacientes` | Lista com busca por nome ou CPF |
| `/pacientes/:id` | Ficha do paciente e histórico médico (RF6, RN6) |
| `/pacientes/novo` · `/:id/editar` | Cadastro |
| `/profissionais` | Profissionais em grade ou tabela |
| `/profissionais/:id` | Agenda do dia e disponibilidade semanal (RF7) |
| `/profissionais/novo` · `/:id/editar` | Cadastro |
| `/design-system` | Design system vivo |

## Estrutura

A organização espelha a do back-end: um diretório por módulo de domínio.

```
src/
├── app/            # layout, rotas, tema
├── ds/             # design system — componentes genéricos (sem domínio)
├── componentes/    # componentes de domínio usados por mais de um módulo
├── modulos/        # uma pasta por módulo: painel, pacientes, profissionais,
│                   # consultas, internacoes, quartos, design-system
├── api/            # acesso a dados — hoje lê os dados de exemplo
├── dominio/        # regras de negócio que a interface antecipa (RN3, RN5…)
├── dados/          # dados de exemplo (gerados relativos à data de hoje)
├── lib/            # datas, formatação, rótulos dos enums
├── tipos/          # tipos do domínio, espelhando o diagrama de classes
└── estilos/        # tokens do design system
```

**Regras de dependência**, as mesmas do back-end: `ds/` não conhece o domínio; `modulos/` nunca importa de outro módulo — o que é compartilhado vai para `componentes/`; páginas só leem dados por `api/`.

## Ligando na API

Cada função de [`src/api/index.ts`](src/api/index.ts) tem o nome e o formato do endpoint correspondente em [`docs/api.md`](../docs/api.md). Quando o back-end existir:

1. Trocar o corpo das funções de `src/api/` por `fetch('/api/v1/...')`.
2. Apagar `src/dados/semente.ts`.
3. Substituir `usePrototipo()` por chamadas reais e tratar o formato de erro padrão (`codigo`, `mensagem`, `detalhes`).

## Design system

Documentado em [`docs/design-system.md`](../docs/design-system.md) e navegável em `/design-system`.
