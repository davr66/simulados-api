import 'dotenv/config';

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável obrigatória ausente: ${nome}`);
  return valor;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: obrigatoria('DATABASE_URL'),
  port: Number(process.env.PORT ?? 3000),
};