import knex, { type Knex } from 'knex';
import { config } from '../config.js';

export const database: Knex = knex({
  client: 'pg',
  connection: config.databaseUrl,
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
});
