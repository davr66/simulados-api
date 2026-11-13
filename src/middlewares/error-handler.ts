import type { ErrorRequestHandler } from 'express';

interface ErroHttp extends Error {
  statusCode?: number;
}

function temStatusCode(erro: Error): erro is ErroHttp {
  return typeof (erro as ErroHttp).statusCode === 'number';
}

export const errorHandler: ErrorRequestHandler = (erro, _request, response, next) => {
  void next;
  const erroNormalizado = erro instanceof Error ? erro : new Error('Erro desconhecido.');
  const statusCode = temStatusCode(erroNormalizado) ? erroNormalizado.statusCode ?? 500 : 500;

  if (statusCode === 500) {
    console.error(erroNormalizado);
  }

  response.status(statusCode).json({
    status: 'error',
    statusCode,
    message:
      statusCode === 500 ? 'Erro interno do servidor.' : erroNormalizado.message,
  });
};
