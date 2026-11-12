import type { FiltrosSimulado, QuestaoComAlternativas } from '../types/simulado.js';

export interface SimuladoRepository {
  bancaExiste(bancaId: number): Promise<boolean>;
  concursoExiste(concursoId: number): Promise<boolean>;
  buscarQuestoes(filtros: FiltrosSimulado): Promise<QuestaoComAlternativas[]>;
}
