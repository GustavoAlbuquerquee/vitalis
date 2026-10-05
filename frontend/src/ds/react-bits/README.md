# Componentes do React Bits

Copiados de [React Bits](https://reactbits.dev) (variante TypeScript + CSS), de David Haz,
sob a licença MIT + Commons Clause em [LICENSE.md](LICENSE.md). A licença permite usar os
componentes dentro de um produto; não permite vender ou redistribuir os componentes em si.

| Componente | Onde o Vitalis usa |
|---|---|
| `HoldButton` | Ações que não se desfazem: registrar alta, cancelar consulta, desativar paciente |
| `StatusMark` | Marcas das regras de negócio na verificação do agendamento |
| `CountUp` | Números do painel |
| `SplitFlapText` | Painel de chamada (próximo atendimento) |
| `TearTicket` | Comprovante de agendamento destacável |

Alterações em relação ao original:

- cores e fontes vêm dos tokens do Vitalis (`var(--brand)`, `var(--fonte-mono)`…), pelos props e pelo CSS;
- textos para leitor de tela traduzidos para o português;
- `SplitFlapText` ganhou o callback `onPhraseChange`, para a legenda do painel de chamada acompanhar as plaquinhas;
- ajustes de tipo exigidos pelo `tsconfig` estrito do projeto.

A lógica dos componentes não foi alterada.
