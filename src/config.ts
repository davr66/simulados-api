import 'dotenv/config';

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável obrigatória ausente: ${nome}`);
  return valor;
}

function booleanoConfigurado(nome: string, valorPadrao: boolean): boolean {
  const valor = process.env[nome];

  if (valor === undefined) {
    return valorPadrao;
  }

  if (valor === 'true') {
    return true;
  }

  if (valor === 'false') {
    return false;
  }

  throw new Error(`Variável booleana inválida: ${nome}`);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: obrigatoria('DATABASE_URL'),
  port: Number(process.env.PORT ?? 3000),
  filtrosAvancadosEnabled: booleanoConfigurado('SIMULADO_FILTROS_AVANCADOS_ENABLED', true),
};