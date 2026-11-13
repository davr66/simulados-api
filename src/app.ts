import express from 'express';
import { KnexSimuladoRepository } from './repositories/knex-simulado.repository.js';
import { SimuladoController } from './controllers/simulado.controller.js';
import { CriarSimuladoService } from './services/criar-simulado.service.js';
import { criarRotasDeSimulado } from './routes/simulado.routes.js';
import { database } from './db/database.js';
import { errorHandler } from './middlewares/error-handler.js';
import { config } from './config.js';
import { logger } from './observability/logger.js';

export function criarApp(): express.Express {
  const repository = new KnexSimuladoRepository(database);
  const service = new CriarSimuladoService(repository);
  const controller = new SimuladoController(service, {
    filtrosAvancadosEnabled: config.filtrosAvancadosEnabled,
  });
  const app = express();

  app.use(express.json());
  app.use((request, response, next) => {
    const inicio = Date.now();

    response.on('finish', () => {
      logger.info('Requisição HTTP concluída', {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - inicio,
      });
    });

    next();
  });
  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.use('/api/v1', criarRotasDeSimulado(controller));
  app.use(errorHandler);

  return app;
}

export const app = criarApp();
