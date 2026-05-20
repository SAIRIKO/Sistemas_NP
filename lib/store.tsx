"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { User, Role, Proposal, CoordinatorProfile, Status, UserPermissions } from './types';
import { mockProposals } from './mock';
import { mockUsers, MOCK_PASSWORD } from './users';

// ── Chat IA Types ──
export interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  parentId?: string;
}

interface AppContextType {
  // Auth
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, role: Role, password: string, parentId?: string, justification?: string) => { success: boolean; error?: string };
  logout: () => void;
  // Legacy role (kept for backward compat while loggedout/switching)
  role: Role;
  setRole: (role: Role) => void;

  // ── Access Management ──
  allUsers: User[];
  updateUser: (id: string, data: Partial<User>) => void;
  getEffectivePermissions: (userId: string) => UserPermissions;
  // Data
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  isProposalsLoading: boolean;
  coordinatorProfiles: CoordinatorProfile[];
  isCoordinatorsLoading: boolean;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  
  // Persisted Filters
  areasFilter: string[];
  setAreasFilter: React.Dispatch<React.SetStateAction<string[]>>;
  roleFilter: string;
  setRoleFilter: React.Dispatch<React.SetStateAction<string>>;
  phasesFilter: string[];
  setPhasesFilter: React.Dispatch<React.SetStateAction<string[]>>;
  mastersFilter: string[];
  setMastersFilter: React.Dispatch<React.SetStateAction<string[]>>;
  ymedCoordinatorsFilter: string[];
  setYmedCoordinatorsFilter: React.Dispatch<React.SetStateAction<string[]>>;

  // ── Chat IA ──
  chatSessions: ChatSession[];
  activeChatId: string | null;
  isPopupOpen: boolean;
  isPopupMinimized: boolean;
  isLaunchModalOpen: boolean;
  openLaunchModal: () => void;
  closeLaunchModal: () => void;
  openChatPopup: () => void;
  closeChatPopup: () => void;
  minimizePopup: () => void;
  restorePopup: () => void;
  newChat: () => ChatSession;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessageToActiveChat: (msg: ChatMessage) => void;
  getActiveSession: () => ChatSession | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<Role>('Diretor');
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [coordinatorProfiles, setCoordinatorProfiles] = useState<CoordinatorProfile[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Filters State
  const [areasFilter, setAreasFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [phasesFilter, setPhasesFilter] = useState<string[]>([]);
  const [mastersFilter, setMastersFilter] = useState<string[]>([]);
  const [ymedCoordinatorsFilter, setYmedCoordinatorsFilter] = useState<string[]>([]);

  // ── Chat IA State ──
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupMinimized, setIsPopupMinimized] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  // Rehydrate chat sessions from localStorage (per user)
  useEffect(() => {
    const userId = currentUser?.id ?? 'guest';
    const key = `central_propostas_chat_sessions_${userId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatSession[];
        setChatSessions(parsed);
      } else {
        setChatSessions([]); // reset for new user
      }
    } catch { /* ignore */ }
  }, [currentUser?.id]);

  // Persist chat sessions to localStorage (per user)
  useEffect(() => {
    const userId = currentUser?.id ?? 'guest';
    const key = `central_propostas_chat_sessions_${userId}`;
    if (chatSessions.length > 0) {
      localStorage.setItem(key, JSON.stringify(chatSessions));
    }
  }, [chatSessions, currentUser?.id]);

  const newChat = useCallback((): ChatSession => {
    const session: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'Nova Conversa',
      createdAt: new Date().toISOString(),
      messages: [{ role: 'ai', content: 'Olá! Como posso ajudar você hoje?' }],
    };
    setChatSessions(prev => [session, ...prev]);
    setActiveChatId(session.id);
    return session;
  }, []);

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChatSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      // If deleting active chat, reset active
      if (id === activeChatId) setActiveChatId(next[0]?.id ?? null);
      // Update localStorage
      const userId = currentUser?.id ?? 'guest';
      const key = `central_propostas_chat_sessions_${userId}`;
      if (next.length > 0) localStorage.setItem(key, JSON.stringify(next));
      else localStorage.removeItem(key);
      return next;
    });
  }, [activeChatId, currentUser?.id]);

  const addMessageToActiveChat = useCallback((msg: ChatMessage) => {
    setChatSessions(prev => prev.map(s => {
      if (s.id !== activeChatId) return s;
      const updated = { ...s, messages: [...s.messages, msg] };
      // Auto-title from first user message
      if (msg.role === 'user' && s.messages.filter(m => m.role === 'user').length === 0) {
        updated.title = msg.content.slice(0, 40) + (msg.content.length > 40 ? '...' : '');
      }
      return updated;
    }));
  }, [activeChatId]);

  const getActiveSession = useCallback((): ChatSession | undefined => {
    return chatSessions.find(s => s.id === activeChatId);
  }, [chatSessions, activeChatId]);

  const openLaunchModal = useCallback(() => setIsLaunchModalOpen(true), []);
  const closeLaunchModal = useCallback(() => setIsLaunchModalOpen(false), []);

  const openChatPopup = useCallback(() => {
    if (!activeChatId || !chatSessions.find(s => s.id === activeChatId)) {
      newChat();
    }
    setIsPopupOpen(true);
    setIsPopupMinimized(false);
  }, [activeChatId, chatSessions, newChat]);

  const closeChatPopup = useCallback(() => {
    setIsPopupOpen(false);
    setIsPopupMinimized(false);
  }, []);

  const minimizePopup = useCallback(() => setIsPopupMinimized(true), []);
  const restorePopup = useCallback(() => setIsPopupMinimized(false), []);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('central_propostas_session');
      if (saved) {
        const parsed = JSON.parse(saved) as AuthUser;
        setCurrentUser(parsed);
        setRoleState(parsed.role);
      }
      
      const savedUsers = localStorage.getItem('central_propostas_users');
      if (savedUsers) {
        setAllUsers(JSON.parse(savedUsers));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sincroniza usuários do Pipefy na inicialização
  useEffect(() => {
    fetch('/api/auth/sync-users')
      .then(r => r.json())
      .then(data => {
        if (!data.users?.length) return;
        setAllUsers(prev => {
          const existingEmails = new Set(prev.map((u: User) => u.email.toLowerCase()));
          const newUsers: User[] = [];

          for (const pu of data.users) {
            if (!pu.email || existingEmails.has(pu.email.toLowerCase())) continue;

            const role = pu.role as Role;
            newUsers.push({
              id: `pipefy-${pu.pipefyId}`,
              name: pu.name || pu.email,
              email: pu.email,
              role,
              // Usuários sem permissão definida ficam pendentes
              status: role === 'Assistente' ? 'pending_approval' : 'active',
              history: [`Pré-cadastro sincronizado do Pipefy (pipe ${pu.pipeId})`],
            });
            existingEmails.add(pu.email.toLowerCase());
          }

          if (newUsers.length === 0) return prev;
          const merged = [...prev, ...newUsers];
          localStorage.setItem('central_propostas_users', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => { /* falha silenciosa — offline ou token expirado */ });
  }, []);

  useEffect(() => {
    if (allUsers !== mockUsers) {
      localStorage.setItem('central_propostas_users', JSON.stringify(allUsers));
    }
  }, [allUsers]);


  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { 
          ...u, 
          ...data,
          history: data.history ? [...(u.history || []), ...data.history] : u.history 
        };
      }
      return u;
    }));
  }, []);

  const getEffectivePermissions = useCallback((userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    const defaults: Record<string, UserPermissions> = {
      Admin: { 
        portals: { cp: true, ymed: true },
        pages: { dashboard: true, pipeline: true, propostas: true, coordenadores: true, busca: true, comite: true, historico: true, ia: true, feedbacks: true, configuracoes: true }, 
        ymedPages: { dashboard: true, pipeline: true, propostas: true, coordenadores: true, busca: true, comite: true, historico: true, ia: true },
        functions: { canEdit: true, canVote: true, canMove: true } 
      },
      Diretor: { 
        portals: { cp: true, ymed: true },
        pages: { dashboard: true, pipeline: true, propostas: true, coordenadores: true, busca: true, comite: true, historico: true, ia: true, feedbacks: true }, 
        ymedPages: { dashboard: true, pipeline: true, propostas: true, coordenadores: true, busca: true, comite: true, historico: true, ia: true },
        functions: { canView: true, canVote: true } 
      },
      Coordenador: { 
        portals: { cp: true, ymed: false },
        pages: { dashboard: true, pipeline: true, propostas: true, coordenadores: true, busca: true, ia: true, feedbacks: true }, 
        ymedPages: {},
        functions: { canView: true, canEdit: true } 
      },
      Assistente: { 
        portals: { cp: true, ymed: false },
        pages: { propostas: true }, 
        ymedPages: {},
        functions: { canView: true } 
      }
    };
    
    if (!user) return defaults.Diretor; // fallback safe
    
    if (user.role === 'Assistente' && user.permissionModel === 'inherited' && user.parentId) {
      // recursive call for inherited
      const parent = allUsers.find(u => u.id === user.parentId);
      if (parent) {
        if (parent.permissions) return parent.permissions;
        return defaults[parent.role] || defaults.Diretor;
      }
    }
    
    if (user.permissions) return user.permissions;
    return defaults[user.role] || defaults.Diretor;
  }, [allUsers]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Fetch live proposals from Pipefy API with SWR
  const { data: pipefyData, isLoading: isProposalsLoading } = useSWR('/api/pipefy/cards', fetcher, {
    revalidateOnFocus: true,
  });

  // Fetch coordinator profiles from Pipefy with SWR
  const { data: coordsData, isLoading: isCoordinatorsLoading } = useSWR('/api/pipefy/coordinators', fetcher, {
    revalidateOnFocus: false, // Perfil muda pouco, não precisa de revalidação agressiva
  });

  useEffect(() => {
    if (pipefyData?.cards && Array.isArray(pipefyData.cards) && pipefyData.cards.length > 0) {
      setProposals(pipefyData.cards);
    }
  }, [pipefyData]);

  useEffect(() => {
    if (coordsData?.coordinators && Array.isArray(coordsData.coordinators)) {
      setCoordinatorProfiles(coordsData.coordinators);
    }
  }, [coordsData]);

  // Derived state: filter proposals based on user role
  const visibleProposals = useMemo(() => {
    if (!currentUser) return [];
    const role = currentUser.role;
    
    // Admins and Directors see everything
    if (role === 'Admin' || role === 'Diretor') {
      return proposals;
    }
    
    // Define the target name to filter by
    let targetName = currentUser.name.toLowerCase();
    
    if (role === 'Assistente' && currentUser.parentId) {
      const parent = allUsers.find(u => u.id === currentUser.parentId);
      if (parent) {
        if (parent.role === 'Admin' || parent.role === 'Diretor') return proposals;
        targetName = parent.name.toLowerCase();
      }
    }
    
    // Extract acronym if exists, e.g. "Instituto de Negócios e Saúde (INSBE)" -> "insbe"
    const siglaMatch = targetName.match(/\(([^)]+)\)/);
    const sigla = siglaMatch ? siglaMatch[1].toLowerCase() : targetName;

    return proposals.filter(p => {
      const coordName = (p.coordinator || '').toLowerCase();
      const allCoords = (p.courseCoordinators || '').toLowerCase();
      
      return coordName.includes(targetName) || targetName.includes(coordName) || 
             coordName.includes(sigla) || 
             allCoords.includes(targetName) || allCoords.includes(sigla);
    });
  }, [proposals, currentUser, allUsers]);

  const login = (email: string, password: string) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'E-mail não encontrado.' };
    
    if (user.status === 'pending_approval') {
      return { success: false, error: 'Aguardando aprovação da solicitação. Em caso de urgência, entre em contato pelo e-mail: novos.projetos@unyleya.com.br' };
    }
    if (user.status === 'blocked') {
      return { success: false, error: 'Seu acesso está bloqueado.' };
    }

    // Aceita a senha específica do usuário (salva no cadastro) ou a senha padrão mock
    const validPassword = (user as any).password || MOCK_PASSWORD;
    if (password !== validPassword) return { success: false, error: 'Senha incorreta.' };

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role, parentId: user.parentId };
    setCurrentUser(authUser);
    setRoleState(authUser.role);
    localStorage.setItem('central_propostas_session', JSON.stringify(authUser));
    return { success: true };
  };

  const register = (name: string, email: string, role: Role, password: string, parentId?: string, justification?: string) => {
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }
    if (password !== MOCK_PASSWORD) {
      return { success: false, error: `No MVP, a senha deve ser: ${MOCK_PASSWORD}` };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      parentId,
      justification,
      status: role === 'Assistente' ? 'pending_approval' : 'active',
      history: [`Conta criada em ${new Date().toLocaleDateString('pt-BR')}`]
    };
    setAllUsers(prev => [...prev, newUser]);
    
    if (newUser.status === 'pending_approval') {
      return { success: true, error: 'Aguardando aprovação da solicitação. Em caso de urgência, entre em contato pelo e-mail: novos.projetos@unyleya.com.br' };
    }

    const authUser: AuthUser = { id: newUser.id, name, email, role };
    setCurrentUser(authUser);
    setRoleState(role);
    localStorage.setItem('central_propostas_session', JSON.stringify(authUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setRoleState('Diretor');
    localStorage.removeItem('central_propostas_session');
  };

  const setRole = (r: Role) => {
    setRoleState(r);
    if (currentUser) {
      const updated = { ...currentUser, role: r };
      setCurrentUser(updated);
      localStorage.setItem('central_propostas_session', JSON.stringify(updated));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        role,
        setRole,
        allUsers,
        updateUser,
        getEffectivePermissions,
        proposals: visibleProposals,
        setProposals,
        isProposalsLoading,
        coordinatorProfiles,
        isCoordinatorsLoading,
        globalSearchQuery,
        setGlobalSearchQuery,
        areasFilter,
        setAreasFilter,
        roleFilter,
        setRoleFilter,
        phasesFilter,
        setPhasesFilter,
        mastersFilter,
        setMastersFilter,
        ymedCoordinatorsFilter,
        setYmedCoordinatorsFilter,
        // Chat IA
        chatSessions,
        activeChatId,
        isPopupOpen,
        isPopupMinimized,
        isLaunchModalOpen,
        openLaunchModal,
        closeLaunchModal,
        openChatPopup,
        closeChatPopup,
        minimizePopup,
        restorePopup,
        newChat,
        selectChat,
        deleteChat,
        addMessageToActiveChat,
        getActiveSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
