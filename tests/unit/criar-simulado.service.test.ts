import { describe, expect, it } from 'vitest';
import {
  CriarSimuladoService,
  type QuestaoComAlternativas,
  type SimuladoRepository,
} from '../../src/services/criar-simulado.service.js';
import { NotFoundError } from '../../src/errors/not-found.error.js';
import { ValidationError } from '../../src/errors/validation.error.js';

function criarQuestao(
  id: number,
  alternativas: QuestaoComAlternativas['alternativas'],
): QuestaoComAlternativas {
  return {
    id,
    enunciado: `Enunciado ${id}`,
    alternativas,
  };
}

describe('CriarSimuladoService', () => {
  it('remove o gabarito de todas as alternativas retornadas', async () => {
    // Arrange: repository with alternatives that contain the answer key.
    const repository: SimuladoRepository = {
      bancaExiste: async () => true,
      concursoExiste: async () => true,
      buscarQuestoes: async () => [
        criarQuestao(1, [
          { id: 11, texto: 'A', correta: true },
          { id: 12, texto: 'B', correta: false },
        ]),
      ],
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: generate a simulated exam.
    const resultado = await service.executar({
      bancaId: 1,
      concursoId: 2,
      quantidade: 1,
    });

    // Assert: no returned alternative exposes the answer key.
    expect(resultado[0]?.alternativas).toEqual(
      expect.arrayContaining([
        { id: 11, texto: 'A' },
        { id: 12, texto: 'B' },
      ]),
    );
    expect(resultado[0]?.alternativas).toHaveLength(2);
    expect(resultado[0]?.alternativas.every((alternativa) => !('correta' in alternativa))).toBe(
      true,
    );
  });

  it('embaralha questoes e alternativas com o PRNG injetado', async () => {
    // Arrange: deterministic values select the first item at every Fisher-Yates step.
    const repository: SimuladoRepository = {
      bancaExiste: async () => true,
      concursoExiste: async () => true,
      buscarQuestoes: async () => [
        criarQuestao(1, [
          { id: 11, texto: 'A', correta: true },
          { id: 12, texto: 'B', correta: false },
        ]),
        criarQuestao(2, [
          { id: 21, texto: 'C', correta: false },
          { id: 22, texto: 'D', correta: true },
        ]),
      ],
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: generate the simulated exam.
    const resultado = await service.executar({
      bancaId: 1,
      concursoId: 2,
      quantidade: 2,
    });

    // Assert: both collections follow the deterministic Fisher-Yates result.
    expect(resultado.map((questao) => questao.id)).toEqual([2, 1]);
    expect(resultado[0]?.alternativas.map((alternativa) => alternativa.id)).toEqual([22, 21]);
  });

  it('lança NotFoundError quando a banca informada nao existe', async () => {
    // Arrange: repository reports that the requested bank does not exist.
    const repository: SimuladoRepository = {
      bancaExiste: async () => false,
      concursoExiste: async () => true,
      buscarQuestoes: async () => [],
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: attempt to generate a simulated exam with an invalid bank.
    const execucao = service.executar({
      bancaId: 99,
      concursoId: 2,
      quantidade: 10,
    });

    // Assert: error follows the standard not-found contract.
    await expect(execucao).rejects.toBeInstanceOf(NotFoundError);
    await expect(execucao).rejects.toMatchObject({
      statusCode: 404,
      message: "Banca informada com o ID '99' não foi encontrada.",
    });
  });

  it('lança NotFoundError quando o concurso informado nao existe', async () => {
    // Arrange: repository reports that the requested contest does not exist.
    const repository: SimuladoRepository = {
      bancaExiste: async () => true,
      concursoExiste: async () => false,
      buscarQuestoes: async () => [],
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: attempt to generate a simulated exam with an invalid contest.
    const execucao = service.executar({
      bancaId: 1,
      concursoId: 404,
      quantidade: 10,
    });

    // Assert: error follows the standard not-found contract.
    await expect(execucao).rejects.toMatchObject({
      statusCode: 404,
      message: "Concurso informado com o ID '404' não foi encontrado.",
    });
  });

  it('retorna as questoes disponiveis quando a quantidade solicitada e maior', async () => {
    // Arrange: repository has fewer questions than requested.
    const repository: SimuladoRepository = {
      bancaExiste: async () => true,
      concursoExiste: async () => true,
      buscarQuestoes: async () => [
        criarQuestao(1, [{ id: 11, texto: 'A', correta: true }]),
        criarQuestao(2, [{ id: 21, texto: 'B', correta: true }]),
      ],
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: request more questions than are available.
    const resultado = await service.executar({
      bancaId: 1,
      concursoId: 2,
      quantidade: 50,
    });

    // Assert: all available questions are returned without fabricating items.
    expect(resultado).toHaveLength(2);
    expect(resultado.map((questao) => questao.id)).toEqual([2, 1]);
  });

  it('rejeita quantidade zero antes de consultar o repositorio', async () => {
    // Arrange: repository should not be consulted for an invalid amount.
    let buscaExecutada = false;
    const repository: SimuladoRepository = {
      bancaExiste: async () => true,
      concursoExiste: async () => true,
      buscarQuestoes: async () => {
        buscaExecutada = true;
        return [];
      },
    };
    const service = new CriarSimuladoService(repository, () => 0);

    // Act: attempt to generate a simulated exam with no questions.
    const execucao = service.executar({
      bancaId: 1,
      concursoId: 2,
      quantidade: 0,
    });

    // Assert: invalid input is rejected before repository access.
    await expect(execucao).rejects.toBeInstanceOf(ValidationError);
    await expect(execucao).rejects.toMatchObject({
      statusCode: 400,
      message: 'A quantidade deve ser maior que zero.',
    });
    expect(buscaExecutada).toBe(false);
  });
});
