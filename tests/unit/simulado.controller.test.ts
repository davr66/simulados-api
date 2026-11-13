import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { SimuladoController } from '../../src/controllers/simulado.controller.js';
import { NotFoundError } from '../../src/errors/not-found.error.js';
import { ValidationError } from '../../src/errors/validation.error.js';
import { CriarSimuladoService } from '../../src/services/criar-simulado.service.js';
import type { SimuladoRepository } from '../../src/repositories/simulado.repository.js';

function criarResposta(): Response {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  return response as unknown as Response;
}

function criarServico(): CriarSimuladoService {
  const repository: SimuladoRepository = {
    bancaExiste: async () => true,
    concursoExiste: async () => true,
    buscarQuestoes: async () => [],
  };

  return new CriarSimuladoService(repository, () => 0);
}

function criarRequisicao(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

describe('SimuladoController', () => {
  it('converte filtros obrigatorios e responde com status 200', async () => {
    // Arrange: controller receives query parameters as strings.
    const service = criarServico();
    const executar = vi.spyOn(service, 'executar');
    const controller = new SimuladoController(service);
    const response = criarResposta();
    const resultado = [{ id: 1, enunciado: 'Questão', alternativas: [] }];
    executar.mockResolvedValue(resultado);

    // Act: create a simulated exam with all supported filters.
    await controller.criar(
      criarRequisicao({
        banca_id: '1',
        concurso_id: '2',
        cargo_id: '3',
        materia_id: '4',
        quantidade: '5',
      }),
      response,
    );

    // Assert: controller converts values and returns the service result.
    expect(executar).toHaveBeenCalledWith({
      bancaId: 1,
      concursoId: 2,
      cargoId: 3,
      materiaId: 4,
      quantidade: 5,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(resultado);
  });

  it.each([
    ['banca_id', undefined],
    ['concurso_id', 'abc'],
    ['quantidade', '0'],
    ['cargo_id', '1.5'],
    ['materia_id', '-1'],
    ['quantidade', '9'.repeat(400)],
  ])('rejeita parâmetro %s inválido com ValidationError', async (nome, valor) => {
    // Arrange: controller receives a malformed query parameter.
    const service = criarServico();
    const executar = vi.spyOn(service, 'executar');
    const controller = new SimuladoController(service);
    const request = criarRequisicao({
      banca_id: '1',
      concurso_id: '2',
      quantidade: '5',
      [nome]: valor,
    });

    // Act: attempt to create a simulated exam.
    const execucao = controller.criar(request, criarResposta());

    // Assert: invalid input is rejected before the service is called.
    await expect(execucao).rejects.toBeInstanceOf(ValidationError);
    expect(executar).not.toHaveBeenCalled();
  });

  it('propaga erros de domínio para o middleware', async () => {
    // Arrange: service reports a missing bank.
    const service = criarServico();
    const erro = new NotFoundError("Banca informada com o ID '99' não foi encontrada.");
    vi.spyOn(service, 'executar').mockRejectedValue(erro);
    const controller = new SimuladoController(service);

    // Act: invoke the controller.
    const execucao = controller.criar(
      criarRequisicao({
        banca_id: '99',
        concurso_id: '2',
        quantidade: '1',
      }),
      criarResposta(),
    );

    // Assert: controller preserves the domain error.
    await expect(execucao).rejects.toBe(erro);
  });
});
