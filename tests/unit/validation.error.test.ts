import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors/validation.error.js';

describe('ValidationError', () => {
  it('preserva status HTTP e mensagem de validação', () => {
    // Arrange: create a validation error with a domain message.
    const erro = new ValidationError('A quantidade deve ser um inteiro positivo.');

    // Act: read the public error properties.
    const resultado = {
      name: erro.name,
      statusCode: erro.statusCode,
      message: erro.message,
    };

    // Assert: error is compatible with the standard API error shape.
    expect(resultado).toEqual({
      name: 'ValidationError',
      statusCode: 400,
      message: 'A quantidade deve ser um inteiro positivo.',
    });
  });
});
