import type { Request, Response } from 'express';
import { CriarSimuladoService } from '../services/criar-simulado.service.js';
import { ValidationError } from '../errors/validation.error.js';
import type { FiltrosSimulado } from '../types/simulado.js';

function converterParametro(nome: string, valor: unknown): number {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
    throw new ValidationError(`O parâmetro '${nome}' deve ser um inteiro positivo.`);
  }

  const numero = Number(valor);

  if (!Number.isSafeInteger(numero)) {
    throw new ValidationError(`O parâmetro '${nome}' deve ser um inteiro positivo.`);
  }

  return numero;
}

export class SimuladoController {
  public constructor(private readonly service: CriarSimuladoService) {}

  public async criar(request: Request, response: Response): Promise<void> {
    const filtros: FiltrosSimulado = {
      bancaId: converterParametro('banca_id', request.query.banca_id),
      concursoId: converterParametro('concurso_id', request.query.concurso_id),
      quantidade: converterParametro('quantidade', request.query.quantidade),
    };

    if (request.query.cargo_id !== undefined) {
      filtros.cargoId = converterParametro('cargo_id', request.query.cargo_id);
    }

    if (request.query.materia_id !== undefined) {
      filtros.materiaId = converterParametro('materia_id', request.query.materia_id);
    }

    const resultado = await this.service.executar(filtros);
    response.status(200).json(resultado);
  }
}
