// Tipos para a interface YMed (Unyleya Med)

export type YMedSituation = 
  | 'Em Oferta' 
  | 'Em Cadastro' 
  | 'Em Construção' 
  | 'Suspenso' 
  | 'Descontinuado' 
  | 'Cancelado';

export type YMedCoordinator = 'INSBE' | 'Alano' | 'ILHHH' | 'IJR';

export type YMedStatus = 'Em análise' | 'Recebendo Proposta' | 'Reprovado' | 'Aprovado' | 'Standby';

export interface YMedMetricEntry {
  year: number;
  month: number; // 1-12
  uf: string;
  enrollments: number;     // Matrículas
  preEnrollments: number;  // Pré-matrículas
  sales: number;           // Vendas (R$)
}

export interface YMedHistoryEntry {
  date: string;
  event: string;
}

export interface YMedDiscipline {
  id: string;
  name: string;
  workload: number; // horas
}

export interface YMedCourse {
  id: string;
  name: string;
  coordinator: YMedCoordinator;
  area: string;
  situation: YMedSituation;
  description: string;
  launchDate: string;
  disciplines: YMedDiscipline[];
  history: YMedHistoryEntry[];
  metrics: YMedMetricEntry[];
}

export interface YMedProposal {
  id: string;
  courseName: string;
  coordinator: YMedCoordinator;
  area: string;
  subarea: string;
  requestDate: string;
  currentPhase: string;
  status: YMedStatus;
  pptUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
