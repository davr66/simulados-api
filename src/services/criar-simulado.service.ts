import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../errors/validation.error.js';
import type { SimuladoRepository } from '../repositories/simulado.repository.js';
import type { FiltrosSimulado, QuestaoSemGabarito } from '../types/simulado.js';

export type {
  AlternativaComGabarito,
  AlternativaSemGabarito,
  FiltrosSimulado,
  QuestaoComAlternativas,
  QuestaoSemGabarito,
} from '../types/simulado.js';
export type { SimuladoRepository } from '../repositories/simulado.repository.js';

export type GeradorPseudoaleatorio = () => number;

function embaralhar<T>(itens: T[], gerarNumero: GeradorPseudoaleatorio): T[] {
  const resultado = [...itens];

  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const destino = Math.floor(gerarNumero() * (indice + 1));
    [resultado[indice], resultado[destino]] = [resultado[destino], resultado[indice]];
  }

  return resultado;
}

function ehInteiroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

function validarFiltros(filtros: FiltrosSimulado): void {
  if (!ehInteiroPositivo(filtros.quantidade)) {
    throw new ValidationError('A quantidade deve ser um inteiro positivo.');
  }

  if (!ehInteiroPositivo(filtros.bancaId)) {
    throw new ValidationError('O ID da banca deve ser um inteiro positivo.');
  }

  if (!ehInteiroPositivo(filtros.concursoId)) {
    throw new ValidationError('O ID do concurso deve ser um inteiro positivo.');
  }
}

export class CriarSimuladoService {
  public constructor(
    private readonly repository: SimuladoRepository,
    private readonly gerarNumero: GeradorPseudoaleatorio = Math.random,
  ) {}

  public async executar(filtros: FiltrosSimulado): Promise<QuestaoSemGabarito[]> {
    validarFiltros(filtros);

    if (!(await this.repository.bancaExiste(filtros.bancaId))) {
      throw new NotFoundError(
        `Banca informada com o ID '${filtros.bancaId}' não foi encontrada.`,
      );
    }

    if (!(await this.repository.concursoExiste(filtros.concursoId))) {
      throw new NotFoundError(
        `Concurso informado com o ID '${filtros.concursoId}' não foi encontrado.`,
      );
    }

    const questoes = await this.repository.buscarQuestoes(filtros);
    const questoesEmbaralhadas = embaralhar(questoes, this.gerarNumero);

    return questoesEmbaralhadas
      .slice(0, filtros.quantidade)
      .map((questao) => ({
        id: questao.id,
        enunciado: questao.enunciado,
        alternativas: embaralhar(questao.alternativas, this.gerarNumero).map(
          ({ id, texto }) => ({ id, texto }),
        ),
      }));
  }
}
