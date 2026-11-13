import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

const registry = new Registry();

collectDefaultMetrics({ register: registry });

const requisicoes = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP.',
  labelNames: ['method', 'path', 'status_code'],
  registers: [registry],
});

const erros = new Counter({
  name: 'http_request_errors_total',
  help: 'Total de erros HTTP 5xx.',
  labelNames: ['method', 'path', 'status_code'],
  registers: [registry],
});

const duracoes = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos.',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry],
});

export const metrics = {
  registrarRequisicao(
    labels: { method: string; path: string; status_code: string },
    duracaoSegundos: number,
  ): void {
    requisicoes.inc(labels);
    duracoes.observe(labels, duracaoSegundos);

    if (Number(labels.status_code) >= 500) {
      erros.inc(labels);
    }
  },

  async exposicaoPrometheus(): Promise<string> {
    return registry.metrics();
  },
};
