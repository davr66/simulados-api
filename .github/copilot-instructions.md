# Diretrizes Gerais da Aplicação: API de Simulados de Concursos (Nível B)

## 1. Visão Geral e Objetivo
Esta aplicação é uma API RESTful de alta performance desenvolvida em Node.js 22 (TypeScript) destinada à criação e disponibilização de simulados de questões de concursos públicos. 

O projeto prioriza a entrega contínua pronta para execução via `docker compose up -d --build`, suporte a *seeds* determinísticos, desacoplamento via **Repository Pattern**, e total cobertura de testes e documentação viva.

---

## 2. Stack Tecnológica Obrigatória
* **Runtime:** Node.js 22 LTS
* **Linguagem:** TypeScript (Modo `strict: true` ativado no `tsconfig.json`)
* **Framework Web:** Express.js
* **Banco de Dados:** PostgreSQL 16
* **Query Builder / Migrations:** Knex.js
* **Containerização:** Docker Engine & Docker Compose
* **Testes Automatizados:** Vitest (ou Jest), Supertest (Contrato/E2E)
* **Testes de Carga:** k6
* **Documentação & ADRs:** OpenAPI 3.1, Markdown no formato MADR

---

## 3. Modelagem de Banco de Dados (Knex Schema)

As migrações do Knex devem obrigatoriamente construir a seguinte estrutura relacional no PostgreSQL 16:

### 3.1. Tabela `banca`
* `id` (UUID ou SERIAL, Primary Key)
* `nome` (VARCHAR(150), NOT NULL)
* `sigla` (VARCHAR(30), NOT NULL)
* `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE)

### 3.2. Tabela `concurso`
* `id` (UUID ou SERIAL, Primary Key)
* `banca_id` (FK -> `banca.id`, ON DELETE CASCADE, NOT NULL)
* `nome` (VARCHAR(200), NOT NULL)
* `ano` (INTEGER, NOT NULL)
* `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE)

### 3.3. Tabela `cargo`
* `id` (UUID ou SERIAL, Primary Key)
* `nome` (VARCHAR(150), NOT NULL)
* `nivel` (VARCHAR(50), NOT NULL) -- ex: 'Médio', 'Superior'

### 3.4. Tabela `materia`
* `id` (UUID ou SERIAL, Primary Key)
* `nome` (VARCHAR(150), NOT NULL)

### 3.5. Tabela Pivot `cargo_materia`
* `cargo_id` (FK -> `cargo.id`, ON DELETE CASCADE, NOT NULL)
* `materia_id` (FK -> `materia.id`, ON DELETE CASCADE, NOT NULL)
* **Chave Primária Composta:** `(cargo_id, materia_id)`

### 3.6. Tabela `questao`
* `id` (UUID ou SERIAL, Primary Key)
* `concurso_id` (FK -> `concurso.id`, ON DELETE CASCADE, NOT NULL)
* `cargo_id` (FK -> `cargo.id`, NOT NULL)
* `materia_id` (FK -> `materia.id`, NOT NULL)
* `enunciado` (TEXT, NOT NULL)
* `ano` (INTEGER, NOT NULL)
* `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE)
* **Índices Recomendados:** `(concurso_id, cargo_id, materia_id)` para otimização das buscas do simulado.

### 3.7. Tabela `alternativa`
* `id` (UUID ou SERIAL, Primary Key)
* `questao_id` (FK -> `questao.id`, ON DELETE CASCADE, NOT NULL)
* `texto` (TEXT, NOT NULL)
* `correta` (BOOLEAN, NOT NULL)

---

## 4. Padrão Arquitetural: Repository Pattern
O projeto adota estritamente o **Repository Pattern** para desacoplar as consultas relacionais (Knex) da camada de serviços e regras de negócio.

```
[ Requisicao HTTP ] 
       │
       ▼
[ SimuladoController ] ── Validacao de DTO / Schema
       │
       ▼
[ CriarSimuladoService ] ── Embaralhamento e Sanetizacao (Remove `correta`)
       │
       ▼
[ ISimuladoRepository ] ── Interface de abstração
       │
       ▼
[ KnexSimuladoRepository ] ── SQL com JOINs (questao, concurso, cargo, materia, alternativa)
       │
       ▼
[ PostgreSQL 16 Container ]
```

---

## 5. Regras de Negócio e Contratos de Resposta

1. **Ocultação do Gabarito:** O atributo `correta` (boolean) das alternativas **NUNCA** pode ser retornado no endpoint de geração do simulado.
2. **Aleatoriedade Determinística:** As questões e suas respectivas alternativas devem ser embaralhadas utilizando o algoritmo Fisher-Yates na camada de Service. O gerador de números aleatórios (`PRNG`) deve aceitar injeção de dependência para garantir reprodutibilidade nos testes unitários.
3. **Validação de Entidades Inexistentes (HTTP 404):**
   * Se o `banca_id` ou `concurso_id` informados nos parâmetros de busca não existirem no banco de dados, a API deve estourar um erro customizado capturado pelo middleware global e retornar **HTTP 404 Not Found**.
4. **Retorno Parcial de Questões (HTTP 200):**
   * Se a requisição solicitar `quantidade=50`, mas os filtros combinados retornarem apenas 20 questões disponíveis no banco, a API deve responder com **HTTP 200 OK** contendo o array com as 20 questões encontradas.
5. **Estrutura Standard de Erros:**
   ```json
   {
     "status": "error",
     "statusCode": 404,
     "message": "Banca informada com o ID 'x' não foi encontrada."
   }
   ```

---

## 6. Documentação Viva Obrigatória (`docs/`)
* `docs/openapi.json`: Especificação OpenAPI 3.1 do endpoint de geração de simulados cobrindo os casos de sucesso (200), erro de validação (400), não encontrado (404) e erro interno (500).
* `docs/adr/0001-cargo-materia-model.md`: Registro da decisão arquitetural sobre a modelagem da relação N:N entre cargos e matérias no formato MADR.
* `docs/k6-report.md`: Relatório resumido da execução dos testes de estresse/carga contendo as métricas de latência e Throughput.
* `docs/ia.md`: Histórico de interação, prompts relevantes e assistência da IA no desenvolvimento.