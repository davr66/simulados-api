import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../src/middlewares/error-handler.js';
import { NotFoundError } from '../../src/errors/not-found.error.js';

function criarResposta(): Response {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  return response as unknown as Response;
}

describe('errorHandler', () => {
  it('retorna erro de domínio no formato HTTP padronizado', () => {
    // Arrange: middleware receives a not-found domain error.
    const response = criarResposta();
    const erro = new NotFoundError("Banca informada com o ID '99' não foi encontrada.");

    // Act: normalize the error response.
    errorHandler(erro, {} as Request, response, vi.fn());

    // Assert: status and payload preserve the domain contract.
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 404,
      message: "Banca informada com o ID '99' não foi encontrada.",
    });
  });

  it('oculta detalhes de erros internos', () => {
    // Arrange: middleware receives an unexpected internal error.
    const response = criarResposta();
    const erro = new Error('Detalhe interno sensível.');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act: normalize the error response.
    errorHandler(erro, {} as Request, response, vi.fn());

    // Assert: response exposes only the standard internal-error message.
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Erro interno do servidor.',
    });
    expect(consoleError).toHaveBeenCalledWith(erro);
    consoleError.mockRestore();
  });

  it('normaliza rejeicoes que nao sao instancias de Error', () => {
    // Arrange: middleware receives an unknown rejection value.
    const response = criarResposta();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act: normalize the unknown error response.
    errorHandler('falha desconhecida', {} as Request, response, vi.fn());

    // Assert: response uses the safe internal-error contract.
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Erro interno do servidor.',
    });
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
    consoleError.mockRestore();
  });
});
