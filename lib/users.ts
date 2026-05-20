import { User } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Ana Carolina Diretora',
    email: 'diretora@unyleya.edu.br',
    role: 'Diretor',
    status: 'active',
  },
  {
    id: 'user-002',
    name: 'Admin Sistema',
    email: 'admin@unyleya.edu.br',
    role: 'Admin',
    status: 'active',
  },
  {
    id: 'user-003',
    name: 'Carlos Henrique',
    email: 'carlos@unyleya.edu.br',
    role: 'Diretor',
    status: 'active',
  },
  {
    id: 'user-004',
    name: 'Instituto de Negócios e Saúde (INSBE)',
    email: 'insbe@unyleya.edu.br',
    role: 'Coordenador',
    status: 'active',
  },
  {
    id: 'user-005',
    name: 'Maria Souza (Assist. INSBE)',
    email: 'maria.souza@unyleya.edu.br',
    role: 'Assistente',
    status: 'active',
    parentId: 'user-004',
    permissionModel: 'inherited',
    history: ['Acesso aprovado pelo Admin em 20/05/2026'],
  },
  {
    id: 'user-006',
    name: 'Pedro Lima (Assist. Ana Carolina)',
    email: 'pedro.lima@unyleya.edu.br',
    role: 'Assistente',
    status: 'active',
    parentId: 'user-001',
    permissionModel: 'limited',
    permissions: {
      portals: { cp: true },
      pages: { dashboard: true, propostas: true, ia: true },
      ymedPages: {},
      functions: { canView: true }
    },
    history: ['Permissões limitadas aplicadas em 20/05/2026'],
  },
  {
    id: 'user-007',
    name: 'Lucas Novo',
    email: 'lucas.novo@unyleya.edu.br',
    role: 'Assistente',
    status: 'pending_approval',
    parentId: 'user-004',
    justification: 'Fui recém contratado para auxiliar o coordenador.',
    history: ['Solicitação criada em 20/05/2026'],
  }
];

// Mock password — all users share the same password in the demo
export const MOCK_PASSWORD = 'Unyleya@2026';
