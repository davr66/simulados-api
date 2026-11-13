# Observabilidade

## Logs

A aplicação usa [Pino](https://getpino.io/) e escreve um evento JSON por linha em
stdout/stderr. Os eventos de inicialização e de conclusão de requisições incluem
ambiente, rota, status e duração. Erros internos incluem a mensagem e a stack
para diagnóstico no provedor de deploy.

## Métricas RED

`GET /metrics` expõe métricas no formato Prometheus usando `prom-client`:

- `http_requests_total`: taxa/volume de requisições por método, rota e status;
- `http_request_errors_total`: respostas HTTP 5xx;
- `http_request_duration_seconds`: histograma de duração das requisições.

A rota `/metrics` também pode incluir as métricas padrão do processo Node.js.

## Tracing por requisição

Cada requisição recebe um `X-Trace-Id` UUID. Se o cliente enviar esse cabeçalho,
o valor será validado, propagado na resposta e incluído nos logs da requisição.
Isso permite localizar uma chamada específica nos logs do Render:

```text
X-Trace-Id: trace-de-teste-123
```

Esse mecanismo fornece correlação de requisições e logs. Ele não substitui
tracing distribuído com spans e exportador OpenTelemetry.
