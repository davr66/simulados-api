import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { database } from '../../src/db/database.js';
import { executarSeed } from '../../src/db/seed.js';
import { KnexSimuladoRepository } from '../../src/repositories/knex-simulado.repository.js';
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

  it('respeita a quantidade solicitada', async () => {
    // Act: request fewer questions than the contest contains.
    const resultado = await repository.buscarQuestoes({
      bancaId: 1,
      concursoId: 1,
      quantidade: 7,
    });

    // Assert: database query returns no more than requested.
    expect(resultado).toHaveLength(7);
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
});
