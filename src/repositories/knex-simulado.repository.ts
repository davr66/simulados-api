import type { Knex } from 'knex';
import type {
  AlternativaComGabarito,
  FiltrosSimulado,
  QuestaoComAlternativas,
} from '../types/simulado.js';
import type { SimuladoRepository } from './simulado.repository.js';

interface QuestaoRow {
  id: number;
  enunciado: string;
}

interface QuestaoComAlternativaRow extends QuestaoRow {
  alternativa_id: number | null;
  alternativa_texto: string | null;
  alternativa_correta: boolean | null;
}

export class KnexSimuladoRepository implements SimuladoRepository {
  public constructor(private readonly database: Knex) {}

  public async bancaExiste(bancaId: number): Promise<boolean> {
    const banca = await this.database('banca').select('id').where('id', bancaId).first();
    return banca !== undefined;
  }

  public async concursoExiste(concursoId: number): Promise<boolean> {
    const concurso = await this.database('concurso').select('id').where('id', concursoId).first();
    return concurso !== undefined;
  }

  public async buscarQuestoes(filtros: FiltrosSimulado): Promise<QuestaoComAlternativas[]> {
    const questoes = await this.buscarIdsDasQuestoes(filtros);

    if (questoes.length === 0) {
      return [];
    }

    const ids = questoes.map((questao) => questao.id);
    const linhas = await this.database('questao')
      .leftJoin('alternativa', 'alternativa.questao_id', 'questao.id')
      .select(
        'questao.id',
        'questao.enunciado',
        'alternativa.id as alternativa_id',
        'alternativa.texto as alternativa_texto',
        'alternativa.correta as alternativa_correta',
      )
      .whereIn('questao.id', ids)
      .orderBy('questao.id')
      .orderBy('alternativa.id') as QuestaoComAlternativaRow[];

    return this.agruparQuestoes(linhas, ids);
  }

  private async buscarIdsDasQuestoes(filtros: FiltrosSimulado): Promise<QuestaoRow[]> {
    const consulta = this.database('questao')
      .join('concurso', 'concurso.id', 'questao.concurso_id')
      .select('questao.id', 'questao.enunciado')
      .where('concurso.banca_id', filtros.bancaId)
      .andWhere('questao.concurso_id', filtros.concursoId)
      .modify((query) => {
        if (filtros.cargoId !== undefined) {
          query.andWhere('questao.cargo_id', filtros.cargoId);
        }
        if (filtros.materiaId !== undefined) {
          query.andWhere('questao.materia_id', filtros.materiaId);
        }
      })
      .orderBy('questao.id')
      .limit(filtros.quantidade);

    return (await consulta) as QuestaoRow[];
  }

  private agruparQuestoes(
    linhas: QuestaoComAlternativaRow[],
    idsOrdenados: number[],
  ): QuestaoComAlternativas[] {
    const porId = new Map<number, QuestaoComAlternativas>();

    for (const linha of linhas) {
      const questao = porId.get(linha.id) ?? {
        id: linha.id,
        enunciado: linha.enunciado,
        alternativas: [],
      };

      if (linha.alternativa_id !== null) {
        const alternativa: AlternativaComGabarito = {
          id: linha.alternativa_id,
          texto: linha.alternativa_texto ?? '',
          correta: linha.alternativa_correta ?? false,
        };
        questao.alternativas.push(alternativa);
      }

      porId.set(linha.id, questao);
    }

    return idsOrdenados.flatMap((id) => {
      const questao = porId.get(id);
      return questao === undefined ? [] : [questao];
    });
  }
}
