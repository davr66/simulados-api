import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('alternativa', (table) => {
    table.increments('id').primary();
    table.integer('questao_id').unsigned().notNullable();
    table.text('texto').notNullable();
    table.boolean('correta').notNullable();

    table
      .foreign('questao_id')
      .references('id')
      .inTable('questao')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('alternativa');
}
