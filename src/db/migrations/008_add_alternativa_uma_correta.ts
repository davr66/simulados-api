import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE UNIQUE INDEX alternativa_uma_correta
    ON alternativa (questao_id)
    WHERE correta = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP INDEX IF EXISTS alternativa_uma_correta');
}
