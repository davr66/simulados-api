import { database } from './database.js';

async function migrate(): Promise<void> {
  try {
    await database.migrate.latest();
    console.log('Migrações executadas com sucesso.');
  } finally {
    await database.destroy();
  }
}

migrate().catch((error: unknown) => {
  console.error('Falha ao executar as migrações.', error);
  process.exitCode = 1;
});
