import { Router } from 'express';
import { SimuladoController } from '../controllers/simulado.controller.js';

export function criarRotasDeSimulado(controller: SimuladoController): Router {
  const router = Router();

  router.get('/simulados', (request, response, next) => {
    controller.criar(request, response).catch(next);
  });

  return router;
}
