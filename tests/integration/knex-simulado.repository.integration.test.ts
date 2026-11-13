import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { database } from '../../src/db/database.js';
import { executarSeed } from '../../src/db/seed.js';
import { KnexSimuladoRepository } from '../../src/repositories/knex-simulado.repository.js';
import { NotFoundError } from '../../src/errors/not-found.error.js';
import type {
  AlternativaComGabarito,
  FiltrosSimulado,
  QuestaoComAlternativas,
} from '../../src/types/simulado.js';

type FiltrosConsulta = FiltrosSimulado & {
  cargoId?: number;
  materiaId?: number;
};

describe('KnexSimuladoRepository', () => {
  let repository: KnexSimuladoRepository;

  beforeAll(async () => {
    // Arrange: apply the real database migrations once for the integration suite.
    await database.migrate.latest();
    repository = new KnexSimuladoRepository(database);
  });

  beforeEach(async () => {
    // Arrange: load the official deterministic seed before every test.
    await executarSeed(database);
  });

  afterAll(async () => {
    // Assert: release the real PostgreSQL connection after the suite.
    await database.destroy();
  });

  it('identifica banca existente e inexistente', async () => {
    // Act: query existing and missing banks.
    const existente = await repository.bancaExiste(1);
    const inexistente = await repository.bancaExiste(999);

    // Assert: existence checks reflect the persisted seed.
    expect(existente).toBe(true);
    expect(inexistente).toBe(false);
  });

  it('identifica concurso existente e inexistente', async () => {
    // Act: query existing and missing contests.
    const existente = await repository.concursoExiste(1);
    const inexistente = await repository.concursoExiste(999);

    // Assert: existence checks reflect the persisted seed.
    expect(existente).toBe(true);
    expect(inexistente).toBe(false);
  });

  it('busca questoes pertencentes ao concurso informado', async () => {
    // Act: search questions from one contest.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      quantidade: 50,
    });

    // Assert: all 40 seeded questions belong to that contest.
    expect(resultado).toHaveLength(40);
    expect(
      resultado.every((questao: QuestaoComAlternativas) =>
        questao.enunciado.includes('concurso 1'),
      ),
    ).toBe(true);
  });

  it('aplica filtros combinados de banca, cargo e materia', async () => {
    // Act: search with all relational filters.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      cargoId: 1,
      materiaId: 3,
      quantidade: 50,
    } as FiltrosConsulta);

    // Assert: the seed has ten matching questions in this combination.
    expect(resultado).toHaveLength(10);
  });

  it('retorna o universo completo para que o service aplique a quantidade apos o shuffle', async () => {
    // Act: request fewer questions than the contest contains.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      quantidade: 7,
    });

    // Assert: repository does not remove candidates before randomization.
    expect(resultado).toHaveLength(40);
  });

  it('retorna questoes com suas alternativas e preserva correta internamente', async () => {
    // Act: load one question and its alternatives from PostgreSQL.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      quantidade: 1,
    });

    // Assert: repository keeps the answer key for the service layer.
    const alternativas: AlternativaComGabarito[] = resultado[0]?.alternativas ?? [];
    expect(alternativas).toHaveLength(4);
    expect(alternativas.filter((alternativa) => alternativa.correta)).toHaveLength(1);
    expect(alternativas.every((alternativa) => 'correta' in alternativa)).toBe(true);
  });

  it('retorna vazio quando os filtros nao encontram questoes', async () => {
    // Act: query a valid contest with a non-matching subject filter.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      materiaId: 5,
      quantidade: 50,
    } as FiltrosConsulta);

    // Assert: no unrelated question is returned.
    expect(resultado).toEqual([]);
  });

  it('rejeita combinacao de banca e concurso que nao pertence a banca', async () => {
    // Act: query a real contest through a different existing bank.
    const execucao = repository.buscarQuestoes({
      bancaId: 2,
      concursoId: 1,
      quantidade: 10,
    });

    // Assert: the composite resource is treated as not found.
    await expect(execucao).rejects.toBeInstanceOf(NotFoundError);
    await expect(execucao).rejects.toMatchObject({
      statusCode: 404,
      message: "Concurso informado com o ID '1' não pertence à banca informada com o ID '2'.",
    });
  });

  it('impede duas alternativas corretas na mesma questao', async () => {
    // Arrange: identify a seeded question and its existing correct alternative.
    const questao = await database('questao').select('id').where('id', 1).first();
    expect(questao).toBeDefined();

    // Act: insert another correct alternative for that question.
    const execucao = database('alternativa').insert({
      questao_id: questao?.id,
      texto: 'Segunda alternativa correta.',
      correta: true,
    });

    // Assert: the database constraint allows only one correct alternative.
    await expect(execucao).rejects.toThrow();
  });

  it('impede questao fora da relacao cargo_materia', async () => {
    // Act: insert a question with a cargo/materia pair absent from cargo_materia.
    const execucao = database('questao').insert({
      concurso_id: 1,
      cargo_id: 1,
      materia_id: 5,
      enunciado: 'Questao fora do edital.',
      ano: 2026,
    });

    // Assert: the composite foreign key protects the edital relationship.
    await expect(execucao).rejects.toThrow();
  });

  it('mantem todas as questoes do seed dentro do edital do cargo', async () => {
    // Act: find seeded questions without a matching cargo/materia relationship.
    const foraDoEdital = await database('questao')
      .leftJoin('cargo_materia', function () {
        this.on('cargo_materia.cargo_id', '=', 'questao.cargo_id').andOn(
          'cargo_materia.materia_id',
          '=',
          'questao.materia_id',
        );
      })
      .whereNull('cargo_materia.cargo_id')
      .select('questao.id');

    // Assert: seed data respects the cargo's subject list.
    expect(foraDoEdital).toEqual([]);
  });
});
