import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('questao', (table) => {
    table
      .foreign(['cargo_id', 'materia_id'])
      .references(['cargo_id', 'materia_id'])
      .inTable('cargo_materia');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('questao', (table) => {
    table.dropForeign(['cargo_id', 'materia_id']);
  });
}
