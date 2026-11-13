# Desempenho

## SLO

Para o smoke test do Projeto B, o objetivo é manter o p95 das requisições HTTP
abaixo de 500 ms e a taxa de falhas abaixo de 1%.

## Medição no Render

- Ambiente: `https://simulados-api-staging.onrender.com`
- Carga: 1 VU durante 10 segundos;
- Requisições: 14;
- Iterações: 7;
- Checks aprovados: 21/21;
- Falhas HTTP: 0,00%;
- Duração média: 221,38 ms;
- Mediana: 198,70 ms;
- p90: 219,69 ms;
- **p95: 319,56 ms**;
- Duração máxima: 500,87 ms.

O smoke test foi aprovado porque o p95 ficou abaixo de 500 ms e não houve
falhas HTTP.

O script de carga está em
[tests/load/simulados.smoke.js](../tests/load/simulados.smoke.js).
