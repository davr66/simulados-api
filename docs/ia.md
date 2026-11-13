# Uso de IA

Este projeto foi desenvolvido com assistência de IA (Gemini / GitHub Copilot) integrada ao fluxo de engenharia. As decisões técnicas, a revisão arquitetural, a execução dos testes e a validação do deploy em produção permaneceram sob responsabilidade exclusiva do autor.

## Prompts relevantes

- Analisar a prontidão do projeto para migrations e identificar dependências ausentes no banco de dados.
- Implementar migrations, seed determinístico e constraints relacionais para integridade de domínio.
- Criar o Repository Pattern, service, controller, middleware de erros e suíte de testes (unitários, integração e contrato).
- Avaliar e suprir os requisitos das metas M1 a M4, incluindo a esteira de CI com Gitleaks (segurança) e Spectral (linting de contratos).
- Configurar a observabilidade da aplicação migrando para ferramentas de mercado (`pino` para logs estruturados e `prom-client` para métricas RED).
- Estruturar a documentação de decisões arquiteturais via MADR e gerar o contrato OpenAPI do endpoint principal.
- Criar e validar o smoke test via `k6` contra o ambiente de staging no Render, aferindo o cumprimento do SLO de latência (p95).

## Critérios de uso

A IA atuou como *pair programmer* para sugerir alternativas arquiteturais, localizar inconsistências e acelerar implementações *boilerplate*. As decisões finais de design e integração foram tomadas somente após inspeção rigorosa do código, aprovação de testes (>80% de coverage), validação de tipos, linting e homologação empírica do ambiente publicado.