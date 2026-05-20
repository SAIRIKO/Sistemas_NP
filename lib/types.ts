export type Role = 'Diretor' | 'Admin' | 'Coordenador' | 'Assistente';
export type UserStatus = 'active' | 'pending_approval' | 'blocked';
export type PermissionModel = 'inherited' | 'limited' | 'customized';

export type PortalId = 'cp' | 'ymed';

export interface UserPermissions {
  portals: Partial<Record<PortalId, boolean>>;  // { cp: true, ymed: false }
  pages: Record<string, boolean>;               // pages within CP
  ymedPages: Record<string, boolean>;           // pages within YMed
  functions: Record<string, boolean>;           // actions/functions
}

export type Status = 'Em análise' | 'Recebendo Proposta' | 'Reprovado' | 'Aprovado' | 'Standby';
export type Risk = 'baixo' | 'médio' | 'alto';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status?: UserStatus;
  
  // Relacionamento para Assistentes
  parentId?: string; // ID do Coordenador ou Diretor ao qual está vinculado
  permissionModel?: PermissionModel; 
  justification?: string; // Justificativa ao solicitar acesso
  
  permissions?: UserPermissions; // Permissões específicas configuradas pelo Admin
  history?: string[]; // Histórico de alterações (mock)
}

export interface CoordinatorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  isCurrentCoordinator?: boolean;
}

export interface Proposal {
  id: string;
  pipefyCardId?: string;
  courseName: string;
  coordinator: string;
  area: string;
  subarea: string;
  vertical: string;
  targetAudience?: string;
  requestDate: string;
  currentPhase: string;
  status: Status;
  observations?: string;
  preCommitteeOpinion?: string;
  finalOpinion?: string;
  finalDecision?: string;
  pptUrl?: string;
  videoUrl?: string;
  sharepointUrl?: string;
  maxSimilarity?: number;
  cannibalizationRisk?: Risk;
  priority?: string;
  disciplines?: string;
  courseCoordinators?: string;
  createdAt: string;
  updatedAt: string;
  
  similarCoursesText?: string;
  similarCourses?: SimilarCourse[];
  comments?: Comment[];
  votes?: Vote[];
  histories?: ProposalHistory[];
}

export interface SimilarCourse {
  id: string;
  proposalId: string;
  courseName: string;
  similarityPercent: number;
  coordinator: string;
  situation: string;
  comment?: string;
  g2Id?: string;
  version?: string;
  area?: string;
  workload?: number;
  relationType?: 'canibalização' | 'transversalidade' | 'verticalização' | 'complementaridade' | 'baixa relação';
}

export interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  directorName: string;
  vote: Status;
  comment?: string;
  createdAt: string;
}

export interface ProposalHistory {
  id: string;
  proposalId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  createdAt: string;
}
