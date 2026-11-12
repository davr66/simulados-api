export interface AlternativaComGabarito {
  id: number;
  texto: string;
  correta: boolean;
}

export interface AlternativaSemGabarito {
  id: number;
  texto: string;
}

export interface QuestaoComAlternativas {
  id: number;
  enunciado: string;
  alternativas: AlternativaComGabarito[];
}

export interface QuestaoSemGabarito {
  id: number;
  enunciado: string;
  alternativas: AlternativaSemGabarito[];
}

export interface FiltrosSimulado {
  bancaId: number;
  concursoId: number;
  cargoId?: number;
  materiaId?: number;
  quantidade: number;
}
