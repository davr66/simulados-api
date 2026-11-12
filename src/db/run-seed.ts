import { database } from './database.js';
import { executarSeed } from './seed.js';

async function main(): Promise<void> {
  await executarSeed();
  console.log('Seed executado com sucesso.');
  await database.destroy();
}

main().catch(async (error: unknown) => {
  console.error('Falha ao executar o seed.', error);
  await database.destroy();
  process.exitCode = 1;
});
