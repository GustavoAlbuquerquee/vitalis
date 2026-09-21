# Documentação

| Documento | O que responde |
|---|---|
| [Arquitetura](arquitetura.md) | Como o sistema é dividido e por quê |
| [Requisitos](requisitos.md) | O que o sistema precisa fazer |
| [Regras de negócio](regras-de-negocio.md) | As sete regras, detalhadas e rastreadas até o código |
| [Diagrama de classes](diagrama-de-classes.md) | Domínio, camadas e hierarquia de exceções |
| [Modelo de dados](modelo-de-dados.md) | Como o domínio vira tabelas ou documentos |
| [API](api.md) | Endpoints previstos, recurso por recurso |
| [Glossário](glossario.md) | O vocabulário do hospital, sem ambiguidade |
| [Decisões (ADRs)](decisoes) | Toda escolha arquitetural registrada, com alternativas e consequências |

## Diagramas

Os fontes ficam em [`diagramas/`](diagramas):

| Arquivo | Formato | Uso |
|---|---|---|
| `01-dominio.mmd` | Mermaid | Modelo de domínio |
| `02-camadas.mmd` | Mermaid | Arquitetura em camadas |
| `03-excecoes.mmd` | Mermaid | Hierarquia de exceções |
| `dominio.puml` | PlantUML | Exportar PNG/SVG para o relatório |
| `diagrama-classes.html` | HTML | Versão renderizada, com zoom e download em `.svg` |

Para renderizar o PlantUML:

```bash
java -jar plantuml.jar -tpng docs/diagramas/dominio.puml
```

## Regra de manutenção

Mudou uma regra de negócio? O pull request atualiza [regras-de-negocio.md](regras-de-negocio.md) junto. Mudou a estrutura do domínio? Atualiza o [diagrama de classes](diagrama-de-classes.md).

Documentação desatualizada é pior que documentação nenhuma — a primeira mente, a segunda pelo menos avisa que você precisa perguntar.
