# Uso de IA

Este projeto foi desenvolvido com a assistência de IA (Gemini e GitHub Copilot) integrada ao fluxo de engenharia. A IA atuou como ferramenta de apoio à prototipação e geração de *boilerplate*, mas as decisões de arquitetura, correções de infraestrutura e a validação final permaneceram sob responsabilidade exclusiva do autor.

## Configuração da IA

O contexto do projeto para o agente de codificação (Copilot) foi centralizado em um único arquivo de regras (`.github/copilot-instructions.md`). Ele instruiu a IA a adotar o Repository Pattern e a focar em testes automatizados utilizando Vitest, Supertest e k6. Para decisões arquiteturais e de CI/CD, o Gemini foi utilizado via chat com base no levantamento dos requisitos M1 a M4.

## Prompts que Importaram e Decisões do Autor

Para garantir a qualidade do software, diversas sugestões das ferramentas de IA foram avaliadas, modificadas ou recusadas durante o desenvolvimento. Abaixo estão os principais casos:

**1. Modelagem Relacional (Cargo e Matéria)**
* **Prompt:** "Como modelar a relação entre cargo e matéria no banco de dados para evitar que questões sejam cadastradas fora do edital do cargo?"
* **Sugestão da IA:** Salvar as matérias vinculadas como um *array JSON* diretamente em uma coluna na tabela `cargo`.
* **Minha Decisão:** Recusei a sugestão porque o uso de JSON prejudicaria a normalização, o uso de índices e a integridade referencial. Optei por criar a tabela associativa `cargo_materia` (N:N) com chave primária composta e vincular a tabela `questao` a ela via chave estrangeira composta. (Decisão documentada no MADR `docs/adr/0001-cargo-materia-model.md`).

**2. Teste de Carga e Validação (k6)**
* **Prompt:** "Criar um script de k6 para validar os requisitos não-funcionais (SLO) da API no Render."
* **Sugestão da IA:** Geração de um script de teste de estresse complexo, com simulação de picos extremos e múltiplos estágios de rampa de usuários virtuais.
* **Minha Decisão:** Readequei a sugestão para a versão reduzida e objetiva que está no arquivo `tests/load/simulados.smoke.js`. Configurei um **Smoke Test** focado (1 VU, 10s), que era o suficiente para atestar a estabilidade do deploy e validar o SLO de p95 < 500ms exigido no escopo do projeto, sem sobrecarregar a *free tier* do Render.

**3. Correção de Erro de Infraestrutura (Render e Seed)**
* **Prompt:** "Como rodar a migração, o seed e iniciar o servidor em um único comando no Docker Command do Render?"
* **Sugestão da IA:** Inserir no painel web do Render um comando usando sintaxe de shell nativo: `sh -c "npm run migrate && npm run seed && tsx src/server.ts"`.
* **A Falha:** A sugestão falhou em produção, retornando o erro `127 not found` nos logs, pois o ambiente do Render interpretou as aspas e os comandos de forma incorreta no boot do container.
* **Minha Correção:** Abandonei a configuração via painel web do Render e centralizei a execução no próprio repositório. Modifiquei o script `start` diretamente no arquivo `package.json` para executar a cadeia sequencial: `"npm run migrate && npm run seed && tsx src/server.ts"`. Isso resolveu a quebra e estabilizou o deploy automaticamente via configuração versionada no repositório.

## Critérios de Uso

A utilização da IA não substituiu o entendimento do código. Todas as sugestões, especialmente as relacionadas a banco de dados e contratos de API, foram inspecionadas localmente. O código gerado só foi incorporado ao repositório após execução bem-sucedida do *type-check*, formatação de linting, aprovação dos testes locais e validação prática dos endpoints post-deploy.