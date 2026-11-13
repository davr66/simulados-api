import express from 'express';
import { KnexSimuladoRepository } from './repositories/knex-simulado.repository.js';
import { SimuladoController } from './controllers/simulado.controller.js';
import { CriarSimuladoService } from './services/criar-simulado.service.js';
import { criarRotasDeSimulado } from './routes/simulado.routes.js';
import { database } from './db/database.js';
import { errorHandler } from './middlewares/error-handler.js';
import { config } from './config.js';
import { logger } from './observability/logger.js';
import { metrics } from './observability/metrics.js';
import { executarComTrace, novoTraceId } from './observability/trace-context.js';

export function criarApp(): express.Express {
  const repository = new KnexSimuladoRepository(database);
  const service = new CriarSimuladoService(repository);
  const controller = new SimuladoController(service, {
    filtrosAvancadosEnabled: config.filtrosAvancadosEnabled,
  });
  const app = express();

  app.use(express.json());
  app.use((request, response, next) => {
    const traceId = novoTraceId(request.header('X-Trace-Id'));
    response.setHeader('X-Trace-Id', traceId);
    const inicio = process.hrtime.bigint();

    executarComTrace(traceId, () => {
      response.on('finish', () => {
        const duracaoSegundos = Number(process.hrtime.bigint() - inicio) / 1_000_000_000;
        const path = request.path;
        const labels = {
          method: request.method,
          path,
          status_code: String(response.statusCode),
        };
        metrics.registrarRequisicao(labels, duracaoSegundos);
        logger.info('Requisição HTTP concluída', {
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Math.round(duracaoSegundos * 1000),
        });
      });

      next();
    });
  });
  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.get('/metrics', async (_request, response) => {
    response.type('text/plain').send(await metrics.exposicaoPrometheus());
  });
  app.use('/api/v1', criarRotasDeSimulado(controller));
  app.use(errorHandler);

  return app;
}

export const app = criarApp();
