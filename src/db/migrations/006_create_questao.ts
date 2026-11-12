import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('questao', (table) => {
    table.increments('id').primary();
    table.integer('concurso_id').unsigned().notNullable();
    table.integer('cargo_id').unsigned().notNullable();
    table.integer('materia_id').unsigned().notNullable();
    table.text('enunciado').notNullable();
    table.integer('ano').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table
      .foreign('concurso_id')
      .references('id')
      .inTable('concurso')
      .onDelete('CASCADE');
    table.foreign('cargo_id').references('id').inTable('cargo');
    table.foreign('materia_id').references('id').inTable('materia');
    table.index(['concurso_id', 'cargo_id', 'materia_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('questao');
}
