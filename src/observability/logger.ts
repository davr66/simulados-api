import pino, { type DestinationStream } from 'pino';
import { traceIdAtual } from './trace-context.js';

type CamposLog = Record<string, unknown>;

export interface LoggerAplicacao {
  info(mensagem: string, campos?: CamposLog): void;
  error(mensagem: string, campos?: CamposLog): void;
}

export function criarLogger(destination: DestinationStream = process.stdout): LoggerAplicacao {
  const instance = pino(
    {
      base: null,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    destination,
  );

  return {
    info(mensagem: string, campos: CamposLog = {}): void {
      instance.info({ ...campos, ...(traceIdAtual() ? { traceId: traceIdAtual() } : {}) }, mensagem);
    },

    error(mensagem: string, campos: CamposLog = {}): void {
      instance.error({ ...campos, ...(traceIdAtual() ? { traceId: traceIdAtual() } : {}) }, mensagem);
    },
  };
}

export const logger = criarLogger();
