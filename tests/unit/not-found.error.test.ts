import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../../src/errors/not-found.error.js';

describe('NotFoundError', () => {
  it('preserva status HTTP e mensagem de domínio', () => {
    // Arrange: create a domain error for a missing entity.
    const erro = new NotFoundError("Concurso informado com o ID '404' não foi encontrado.");

    // Act: read the public error properties.
    const resultado = {
      name: erro.name,
      statusCode: erro.statusCode,
      message: erro.message,
    };

    // Assert: error is compatible with the standard API error shape.
    expect(resultado).toEqual({
      name: 'NotFoundError',
      statusCode: 404,
      message: "Concurso informado com o ID '404' não foi encontrado.",
    });
  });
});
