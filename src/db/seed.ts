import type { Knex } from 'knex';
import { database } from './database.js';

async function seed(trx: Knex.Transaction): Promise<void> {
  await trx.raw(`
    TRUNCATE TABLE
      alternativa,
      questao,
      cargo_materia,
      concurso,
      materia,
      cargo,
      banca
    RESTART IDENTITY CASCADE
  `);

  await trx('banca').insert([
    { nome: 'Centro Brasileiro de Pesquisa em Avaliação', sigla: 'CEBRASPE' },
    { nome: 'Fundação Getulio Vargas', sigla: 'FGV' },
  ]);

  await trx('concurso').insert([
    { banca_id: 1, nome: 'Concurso Nacional de Tecnologia', ano: 2026 },
    { banca_id: 2, nome: 'Concurso Estadual de Administração', ano: 2025 },
    { banca_id: 1, nome: 'Concurso Municipal de Controle', ano: 2024 },
  ]);

  await trx('cargo').insert([
    { nome: 'Analista de Sistemas', nivel: 'Superior' },
    { nome: 'Técnico Administrativo', nivel: 'Médio' },
    { nome: 'Auditor de Controle', nivel: 'Superior' },
  ]);

  await trx('materia').insert([
    { nome: 'Língua Portuguesa' },
    { nome: 'Direito Administrativo' },
    { nome: 'Tecnologia da Informação' },
    { nome: 'Raciocínio Lógico' },
    { nome: 'Administração Pública' },
  ]);

  await trx('cargo_materia').insert([
    { cargo_id: 1, materia_id: 1 },
    { cargo_id: 1, materia_id: 2 },
    { cargo_id: 1, materia_id: 3 },
    { cargo_id: 1, materia_id: 4 },
    { cargo_id: 2, materia_id: 1 },
    { cargo_id: 2, materia_id: 2 },
    { cargo_id: 2, materia_id: 3 },
    { cargo_id: 2, materia_id: 4 },
    { cargo_id: 2, materia_id: 5 },
    { cargo_id: 3, materia_id: 1 },
    { cargo_id: 3, materia_id: 2 },
    { cargo_id: 3, materia_id: 3 },
    { cargo_id: 3, materia_id: 4 },
    { cargo_id: 3, materia_id: 5 },
  ]);

  const questoes = Array.from({ length: 120 }, (_, index) => {
    const concursoId = Math.floor(index / 40) + 1;
    const cargoId = concursoId === 1 ? 1 : concursoId === 2 ? 2 : 3;
    const materiaId = (index % 4) + 1;
    const ano = concursoId === 1 ? 2026 : concursoId === 2 ? 2025 : 2024;

    return {
      concurso_id: concursoId,
      cargo_id: cargoId,
      materia_id: materiaId,
      enunciado: `Questão ${index + 1} do concurso ${concursoId} sobre a matéria ${materiaId}.`,
      ano,
    };
  });

  const questaoIds = await trx('questao').insert(questoes).returning('id');

  const alternativas = questaoIds.flatMap(({ id }, index) =>
    Array.from({ length: 4 }, (_, alternativeIndex) => ({
      questao_id: id,
      texto: `Alternativa ${alternativeIndex + 1} da questão ${index + 1}.`,
      correta: alternativeIndex === index % 4,
    })),
  );

  await trx('alternativa').insert(alternativas);
}

export async function executarSeed(databaseInstance: Knex = database): Promise<void> {
  await databaseInstance.transaction(seed);
}
