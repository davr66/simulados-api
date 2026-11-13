import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { database } from '../../src/db/database.js';
import { executarSeed } from '../../src/db/seed.js';

describe('Contrato HTTP de simulados', () => {
  beforeAll(async () => {
    // Arrange: prepare the real PostgreSQL schema for contract requests.
    await database.migrate.latest();
  });

  beforeEach(async () => {
    // Arrange: restore the official deterministic dataset before each request.
    await executarSeed(database);
  });

  afterAll(async () => {
    // Assert: release the PostgreSQL connection after the contract suite.
    await database.destroy();
  });

  it('responde health check com status 200', async () => {
    // Act: call the health endpoint through HTTP.
    const response = await request(app).get('/health');

    // Assert: response follows the health contract.
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('retorna simulado sem expor o gabarito', async () => {
    // Act: request a simulated exam with valid filters.
    const response = await request(app).get('/api/v1/simulados').query({
      banca_id: 1,
      concurso_id: 1,
      quantidade: 3,
    });

    // Assert: success response contains sanitized questions.
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        enunciado: expect.any(String),
        alternativas: expect.any(Array),
      }),
    );
    expect(
      response.body.every((questao: { alternativas: Array<Record<string, unknown>> }) =>
        questao.alternativas.every((alternativa) => {
          expect(alternativa).toEqual({
            id: expect.any(Number),
            texto: expect.any(String),
          });
          return !('correta' in alternativa);
        }),
      ),
    ).toBe(true);
  });

  it('retorna quantidade parcial quando ha menos questoes disponiveis', async () => {
    // Act: request more questions than the filtered dataset contains.
    const response = await request(app).get('/api/v1/simulados').query({
      banca_id: 1,
      concurso_id: 1,
      cargo_id: 1,
      materia_id: 3,
      quantidade: 50,
    });

    // Assert: endpoint returns the available questions with status 200.
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
  });

  it.each([
    ['banca_id', undefined],
    ['concurso_id', 'abc'],
    ['quantidade', '0'],
  ])('retorna 400 quando %s e invalido', async (nome, valor) => {
    // Arrange: start from a valid request and replace one query parameter.
    const query: Record<string, string | undefined> = {
      banca_id: '1',
      concurso_id: '1',
      quantidade: '1',
      [nome]: valor,
    };

    // Act: request the endpoint with invalid input.
    const response = await request(app).get('/api/v1/simulados').query(query);

    // Assert: validation error follows the standard response contract.
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 400,
      message: expect.stringContaining('deve ser um inteiro positivo'),
    });
  });

  it('retorna 404 para banca inexistente', async () => {
    // Act: request a simulated exam for a missing bank.
    const response = await request(app).get('/api/v1/simulados').query({
      banca_id: 999,
      concurso_id: 1,
      quantidade: 1,
    });

    // Assert: missing entity follows the standard not-found contract.
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 404,
      message: "Banca informada com o ID '999' não foi encontrada.",
    });
  });

  it('retorna 404 para concurso inexistente', async () => {
    // Act: request a simulated exam for a missing contest.
    const response = await request(app).get('/api/v1/simulados').query({
      banca_id: 1,
      concurso_id: 999,
      quantidade: 1,
    });

    // Assert: missing entity follows the standard not-found contract.
    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
  });

  it('retorna 404 para concurso pertencente a outra banca', async () => {
    // Act: request a contest through a different existing bank.
    const response = await request(app).get('/api/v1/simulados').query({
      banca_id: 2,
      concurso_id: 1,
      quantidade: 1,
    });

    // Assert: incompatible composite resource is treated as not found.
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 404,
      message: "Concurso informado com o ID '1' não pertence à banca informada com o ID '2'.",
    });
  });
});
