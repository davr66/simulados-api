# Relatório de carga k6

## Ambiente

- URL: `https://simulados-api-staging.onrender.com`
- Endpoint: `/health` e `/api/v1/simulados`
- Execução: 1 VU durante 10 segundos
- Data: 2026-11-13

## Comando

```powershell
docker run --rm -i grafana/k6 run `
  -e BASE_URL=https://simulados-api-staging.onrender.com `
  - < tests/load/simulados.smoke.js
```

## Critérios

- `http_req_failed`: menor que 1%;
- `http_req_duration p(95)`: menor que 500 ms;
- health check com status 200;
- endpoint de simulado com status 200 e pelo menos uma questão.

## Resultado

Resultado da execução contra o Render:

| Métrica | Resultado |
|---|---:|
| Requisições HTTP | 14 |
| Iterações | 7 |
| Checks aprovados | 21/21 |
| Falhas HTTP | 0,00% |
| Duração média | 221,38 ms |
| Mediana | 198,70 ms |
| p90 | 219,69 ms |
| **p95** | **319,56 ms** |
| Duração máxima | 500,87 ms |

### Conclusão

O smoke test foi aprovado. O p95 de `319,56 ms` ficou abaixo do SLO de
`500 ms`, e não houve falhas HTTP durante a execução.
