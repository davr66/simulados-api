import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cargo_materia', (table) => {
    table.integer('cargo_id').unsigned().notNullable();
    table.integer('materia_id').unsigned().notNullable();

    table.primary(['cargo_id', 'materia_id']);
    table
      .foreign('cargo_id')
      .references('id')
      .inTable('cargo')
      .onDelete('CASCADE');
    table
      .foreign('materia_id')
      .references('id')
      .inTable('materia')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cargo_materia');
}
