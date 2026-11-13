# Ambientes

O projeto usa a mesma aplicação e a mesma imagem Docker em ambientes separados
por configuração, banco e volume.

## Desenvolvimento

1. Copie `.env.development.example` para `.env.development`.
2. Troque `POSTGRES_PASSWORD` por uma senha local.
3. Inicie o ambiente:

```powershell
docker compose --env-file .env.development up -d --build
```

A API fica em `http://localhost:3000` e o PostgreSQL fica exposto em
`localhost:5433`. A aplicação dentro do Compose acessa o banco por `db:5432`.

## Staging local

1. Copie `.env.staging.example` para `.env.staging`.
2. Defina uma senha exclusiva para staging. Não reutilize credenciais reais de
   produção.
3. Inicie com um nome de projeto separado e o override de staging:

```powershell
docker compose --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml -p simulados-staging up -d --build
```

A API fica em `http://localhost:3001` e o PostgreSQL fica exposto em
`localhost:5434`. O volume `pgdata_staging` é separado do desenvolvimento.

O recurso de filtros por cargo e matéria é controlado por
`SIMULADO_FILTROS_AVANCADOS_ENABLED`. Ele fica habilitado nos exemplos de
development e staging. Para simular um rollout desabilitado, defina a variável
como `false`; requisições que informarem `cargo_id` ou `materia_id` retornarão
HTTP 400.

Para executar migrações no staging local:

```powershell
docker compose --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml -p simulados-staging exec api npm run migrate
```

## Testes e CI

O CI usa um PostgreSQL efêmero na porta `5432`, com credenciais descartáveis
armazenadas como GitHub Actions Secrets. Configure os seguintes secrets no
repositório em **Settings → Secrets and variables → Actions**:

| Secret | Finalidade |
| --- | --- |
| `CI_POSTGRES_USER` | Usuário do PostgreSQL usado pelo job |
| `CI_POSTGRES_PASSWORD` | Senha descartável do PostgreSQL usada pelo job |
| `CI_POSTGRES_DB` | Nome do banco usado pelo job |

O workflow [.github/workflows/ci.yml](../.github/workflows/ci.yml) injeta esses
secrets no container PostgreSQL e monta a `DATABASE_URL` usada pelas migrations,
seed e testes. Use valores exclusivos para CI; eles não devem ser reutilizados
em development, staging ou produção.

Os arquivos `.env.development`, `.env.staging` e `.env.test` são locais e
ignorados pelo Git. Apenas os arquivos `.example` devem ser versionados.

O CI executa Gitleaks após o checkout para bloquear credenciais ou tokens
acidentalmente versionados. O scan usa o histórico e o conteúdo do repositório;
segredos de execução continuam configurados exclusivamente nos Secrets do
GitHub Actions ou nas variáveis do provedor de deploy.
