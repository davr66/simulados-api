import { Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { criarLogger } from '../../src/observability/logger.js';

describe('logger', () => {
  it('escreve eventos informativos em JSON estruturado usando pino', () => {
    let linha = '';
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        linha += chunk.toString();
        callback();
      },
    });
    const logger = criarLogger(destination);

    logger.info('Requisição HTTP concluída', {
      method: 'GET',
      statusCode: 200,
    });

    const entrada = JSON.parse(linha) as Record<string, unknown>;

    expect(entrada).toMatchObject({
      level: 30,
      msg: 'Requisição HTTP concluída',
      method: 'GET',
      statusCode: 200,
    });
    expect(entrada.time).toEqual(expect.any(String));
  });
});
