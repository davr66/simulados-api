import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

const armazenamento = new AsyncLocalStorage<string>();

export function novoTraceId(valorRecebido?: string): string {
  return valorRecebido && /^[\w-]{1,128}$/.test(valorRecebido)
    ? valorRecebido
    : randomUUID();
}

export function executarComTrace<T>(traceId: string, callback: () => T): T {
  return armazenamento.run(traceId, callback);
}

export function traceIdAtual(): string | undefined {
  return armazenamento.getStore();
}
