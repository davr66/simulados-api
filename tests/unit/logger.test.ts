import { describe, expect, it, vi } from 'vitest';
import { logger } from '../../src/observability/logger.js';

describe('logger', () => {
  it('escreve eventos informativos como JSON estruturado', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logger.info('Requisição HTTP concluída', {
      method: 'GET',
      statusCode: 200,
    });

    const entrada = JSON.parse(consoleLog.mock.calls[0]?.[0] as string) as Record<string, unknown>;

    expect(entrada).toMatchObject({
      level: 'info',
      message: 'Requisição HTTP concluída',
      method: 'GET',
      statusCode: 200,
    });
    expect(entrada.timestamp).toEqual(expect.any(String));

    consoleLog.mockRestore();
  });
});
