import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('concurso', (table) => {
    table.increments('id').primary();
    table.integer('banca_id').unsigned().notNullable();
    table.string('nome', 200).notNullable();
    table.integer('ano').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table
      .foreign('banca_id')
      .references('id')
      .inTable('banca')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('concurso');
}
