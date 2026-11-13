# Simulados API

API RESTful para geração de simulados de questões de concursos públicos.
A aplicação usa Node.js 22, TypeScript strict, Express, Knex e PostgreSQL 16.

## Pré-requisitos

- Docker Engine com Docker Compose;
- Node.js 22 e npm, para executar comandos fora do container.

## Execução rápida

1. Copie `.env.development.example` para `.env.development`.
2. Troque `POSTGRES_PASSWORD` por uma senha local.
3. Suba a aplicação:

```powershell
docker compose --env-file .env.development up -d --build
```

A API estará disponível em `http://localhost:3000`. O health check é:

```text
GET http://localhost:3000/health
```

O seed é executado separadamente quando necessário:

```powershell
docker compose --env-file .env.development exec api npm run seed
```

Para staging local, consulte [docs/environments.md](docs/environments.md).

## Endpoint principal

```text
GET /api/v1/simulados
```

Parâmetros obrigatórios:

- `banca_id`: inteiro positivo;
- `concurso_id`: inteiro positivo;
- `quantidade`: inteiro positivo.

Parâmetros opcionais:

- `cargo_id`;
- `materia_id`.

Exemplo:

```text
/api/v1/simulados?banca_id=1&concurso_id=1&quantidade=5
```

As questões e alternativas são embaralhadas no service, e o campo `correta`
nunca é retornado pelo endpoint.

## Arquitetura

O projeto aplica Repository Pattern para separar persistência, regras de
negócio e HTTP:

```text
HTTP -> Controller -> Service -> Repository -> PostgreSQL
```

A decisão de modelagem de cargo e matéria está registrada em
[docs/adr/0001-cargo-materia-model.md](docs/adr/0001-cargo-materia-model.md).

## Desenvolvimento e qualidade

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run test:coverage
```

O CI executa também migrations, seed, SCA com `npm audit`, Gitleaks e os testes
com PostgreSQL 16.

## Observabilidade

- Logs JSON estruturados com Pino;
- Métricas RED em `GET /metrics`, no formato Prometheus;
- `X-Trace-Id` gerado ou propagado por requisição.

Consulte [docs/observability.md](docs/observability.md).

## Contratos e documentação

- [docs/openapi.json](docs/openapi.json): contrato OpenAPI 3.1;
- [docs/adr/0001-cargo-materia-model.md](docs/adr/0001-cargo-materia-model.md):
  decisão arquitetural;
- [.spectral.yaml](.spectral.yaml): regras de validação OpenAPI.

Valide o contrato com:

```powershell
npm run openapi:lint
```
