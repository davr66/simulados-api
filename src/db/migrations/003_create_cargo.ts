import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cargo', (table) => {
    table.increments('id').primary();
    table.string('nome', 150).notNullable();
    table.string('nivel', 50).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cargo');
}
