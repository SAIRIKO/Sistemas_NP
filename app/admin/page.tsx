"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/lib/store";
import { User, Role, UserStatus, PermissionModel, UserPermissions, PortalId } from "@/lib/types";
import { Users, Shield, GraduationCap, UserCircle, ChevronRight, CheckCircle, XCircle, Settings, Mail, Phone, Clock, Search, BookOpen, Stethoscope, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPage() {
  const { allUsers, updateUser, getEffectivePermissions } = useAppContext();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allUsers, search, roleFilter]);

  const admins = filteredUsers.filter(u => u.role === 'Admin' && u.status === 'active');
  const diretores = filteredUsers.filter(u => u.role === 'Diretor' && u.status === 'active');
  const coordenadores = filteredUsers.filter(u => u.role === 'Coordenador' && u.status === 'active');
  const assistentesAtivos = filteredUsers.filter(u => u.role === 'Assistente' && u.status === 'active');
  const pendingUsers = filteredUsers.filter(u => u.status === 'pending_approval');
  
  const getAssistants = (parentId: string) => allUsers.filter(u => u.role === 'Assistente' && u.parentId === parentId && u.status === 'active');

  const RoleBadge = ({ role }: { role: string }) => {
    switch (role) {
      case 'Admin': return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">Admin</span>;
      case 'Diretor': return <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">Diretoria</span>;
      case 'Coordenador': return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">Coordenador</span>;
      case 'Assistente': return <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">Assistente</span>;
      default: return null;
    }
  };

  const UserCard = ({ user, isChild = false }: { user: User, isChild?: boolean }) => {
    const assistants = getAssistants(user.id);
    
    return (
      <div className={`border dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm transition-all ${isChild ? 'ml-8 mt-2 border-l-4 border-l-slate-300 dark:border-l-slate-600' : 'mb-4'}`}>
        <div 
          className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${isChild ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}
          onClick={() => setEditingUser(user)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              user.role === 'Admin' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              user.role === 'Diretor' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
              user.role === 'Coordenador' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
              'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {user.role === 'Admin' && <Shield className="w-5 h-5" />}
              {user.role === 'Diretor' && <Users className="w-5 h-5" />}
              {user.role === 'Coordenador' && <GraduationCap className="w-5 h-5" />}
              {user.role === 'Assistente' && <UserCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</h3>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        
        {assistants.length > 0 && !isChild && (
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-8">Assistentes Vinculados ({assistants.length})</h4>
            {assistants.map(a => <UserCard key={a.id} user={a} isChild={true} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestão de Usuários</h2>
          <p className="text-slate-500 dark:text-slate-400">Controle de acessos a portais e páginas</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar usuário..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-800"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v: string | null) => setRoleFilter(v || "all")}>
            <SelectTrigger className="w-[160px] bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>{roleFilter === "all" ? "Todos os papéis" : roleFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Diretor">Diretoria</SelectItem>
              <SelectItem value="Coordenador">Coordenador</SelectItem>
              <SelectItem value="Assistente">Assistente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Solicitações Pendentes ({pendingUsers.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.map(user => (
              <Card key={user.id} className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{user.name}</h4>
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300"><Mail className="w-3.5 h-3.5 inline mr-1" />{user.email}</p>
                    {user.justification && (
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-md">
                        <strong>Motivo:</strong> {user.justification}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Analisar Solicitação
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Administradores
            </h3>
            {admins.length === 0 ? <p className="text-sm text-slate-500">Nenhum administrador encontrado.</p> : admins.map(u => <UserCard key={u.id} user={u} />)}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" /> Diretoria
            </h3>
            {diretores.length === 0 ? <p className="text-sm text-slate-500">Nenhum diretor encontrado.</p> : diretores.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" /> Coordenadores
            </h3>
            {coordenadores.length === 0 ? <p className="text-sm text-slate-500">Nenhum coordenador encontrado.</p> : coordenadores.map(u => <UserCard key={u.id} user={u} />)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-slate-500" /> Assistentes
            </h3>
            {assistentesAtivos.length === 0 ? <p className="text-sm text-slate-500">Nenhum assistente encontrado.</p> : assistentesAtivos.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          allUsers={allUsers}
          updateUser={updateUser}
          getEffectivePermissions={getEffectivePermissions}
        />
      )}
    </div>
  );
}

function EditUserModal({ 
  user, 
  onClose, 
  allUsers, 
  updateUser,
  getEffectivePermissions
}: { 
  user: User, 
  onClose: () => void, 
  allUsers: User[],
  updateUser: (id: string, data: Partial<User>) => void,
  getEffectivePermissions: (id: string) => UserPermissions
}) {
  const [status, setStatus] = useState<UserStatus>(user.status || 'active');
  const [role, setRole] = useState<Role>(user.role);
  const [permissionModel, setPermissionModel] = useState<PermissionModel>(user.permissionModel || 'inherited');
  const [parentId, setParentId] = useState<string | undefined>(user.parentId);
  
  const effective = getEffectivePermissions(user.id);
  const [portals, setPortals] = useState<Partial<Record<PortalId, boolean>>>({ ...effective.portals });
  const [pages, setPages] = useState<Record<string, boolean>>({ ...effective.pages });
  const [ymedPages, setYmedPages] = useState<Record<string, boolean>>({ ...effective.ymedPages });
  const [functions, setFunctions] = useState<Record<string, boolean>>({ ...effective.functions });

  const [activeTab, setActiveTab] = useState<'conta'|'portais'|'paginas'>('conta');

  const parent = parentId ? allUsers.find(u => u.id === parentId) : null;
  const isAssistant = role === 'Assistente';
  const isInherited = isAssistant && permissionModel === 'inherited';
  const parentOptions = allUsers.filter(u => ['Diretor', 'Coordenador', 'Admin'].includes(u.role) && u.status === 'active');

  const handleSave = async () => {
    if (user.status === 'pending_approval' && status === 'active') {
      try {
        await fetch('/api/auth/approve-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, role })
        });
      } catch (err) {
        console.error("Failed to approve in pipefy:", err);
      }
    }

    updateUser(user.id, {
      status,
      role,
      parentId,
      permissionModel: isAssistant ? permissionModel : undefined,
      permissions: isInherited ? undefined : { portals, pages, ymedPages, functions },
      history: [`Configurações alteradas por um Admin em ${new Date().toLocaleDateString('pt-BR')}`]
    });
    onClose();
  };

  const Toggle = ({ checked, onChange, disabled, label }: { checked: boolean, onChange: (c: boolean) => void, disabled: boolean, label: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Configurar Acesso</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os portais, páginas e funções de {user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* User Info Header */}
        <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-b dark:border-slate-700 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">{user.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
              <span className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{user.role}</span>
              {parent && <span className="text-xs text-slate-500">Vinc: {parent.name}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b dark:border-slate-700 flex gap-6 shrink-0">
          {[
            { id: 'conta', label: 'Dados da Conta', icon: Settings },
            { id: 'portais', label: 'Portais (Interfaces)', icon: BookOpen },
            { id: 'paginas', label: 'Páginas & Funções', icon: Shield }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.id 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'conta' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status da Conta</label>
                  <Select value={status} onValueChange={(v: any) => v && setStatus(v as UserStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo (Liberado)</SelectItem>
                      <SelectItem value="pending_approval">Aguardando Aprovação</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Papel (Role)</label>
                  <Select value={role} onValueChange={(v: any) => v && setRole(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Diretor">Diretoria</SelectItem>
                      <SelectItem value="Coordenador">Coordenador</SelectItem>
                      <SelectItem value="Assistente">Assistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vincular a (Superior)</label>
                  <Select value={parentId || "none"} onValueChange={(v: string | null) => v && setParentId(v === "none" ? undefined : v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um superior" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum vínculo</SelectItem>
                      {parentOptions.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isAssistant && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Modelo de Permissão</label>
                    <Select value={permissionModel} onValueChange={(v: any) => {
                      if (!v) return;
                      setPermissionModel(v as PermissionModel);
                      if (v === 'inherited' && parent) {
                        const parentPerms = getEffectivePermissions(parent.id);
                        setPortals({ ...parentPerms.portals });
                        setPages({ ...parentPerms.pages });
                        setYmedPages({ ...parentPerms.ymedPages });
                        setFunctions({ ...parentPerms.functions });
                      }
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherited">Herdada (Igual ao {parent?.role || 'Usuário Principal'})</SelectItem>
                        <SelectItem value="limited">Limitada (Reduzida)</SelectItem>
                        <SelectItem value="customized">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'portais' && (
            <div className="space-y-6">
              {isInherited && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-sm p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <strong>Permissões Herdadas:</strong> Você deve alterar o Modelo de Permissão para "Personalizada" para editar os portais.
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-xl border-2 transition-colors ${portals.cp ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={!!portals.cp} onChange={(e) => setPortals(p => ({ ...p, cp: e.target.checked }))} disabled={isInherited} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">Central de Propostas</h4>
                  <p className="text-xs text-slate-500 mt-1">Gestão de cursos gerais Unyleya</p>
                </div>

                <div className={`p-5 rounded-xl border-2 transition-colors ${portals.ymed ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-600 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={!!portals.ymed} onChange={(e) => setPortals(p => ({ ...p, ymed: e.target.checked }))} disabled={isInherited} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">Central YMed</h4>
                  <p className="text-xs text-slate-500 mt-1">Gestão de cursos médicos YMed</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paginas' && (
            <div className="space-y-8">
              {isInherited && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-sm p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <strong>Permissões Herdadas:</strong> Você deve alterar o Modelo de Permissão para "Personalizada" para editar as páginas.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* CP Pages */}
                <div className={`space-y-3 ${!portals.cp ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-700 pb-2 text-sm uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Páginas - CP
                  </h4>
                  <Toggle checked={!!pages['dashboard']} onChange={v => setPages(p => ({ ...p, dashboard: v }))} disabled={isInherited} label="Dashboard" />
                  <Toggle checked={!!pages['pipeline']} onChange={v => setPages(p => ({ ...p, pipeline: v }))} disabled={isInherited} label="Pipeline" />
                  <Toggle checked={!!pages['propostas']} onChange={v => setPages(p => ({ ...p, propostas: v }))} disabled={isInherited} label="Propostas" />
                  <Toggle checked={!!pages['coordenadores']} onChange={v => setPages(p => ({ ...p, coordenadores: v }))} disabled={isInherited} label="Coordenadores" />
                  <Toggle checked={!!pages['busca']} onChange={v => setPages(p => ({ ...p, busca: v }))} disabled={isInherited} label="Busca Avançada" />
                  <Toggle checked={!!pages['comite']} onChange={v => setPages(p => ({ ...p, comite: v }))} disabled={isInherited} label="Comitê" />
                  <Toggle checked={!!pages['historico']} onChange={v => setPages(p => ({ ...p, historico: v }))} disabled={isInherited} label="Histórico" />
                  <Toggle checked={!!pages['ia']} onChange={v => setPages(p => ({ ...p, ia: v }))} disabled={isInherited} label="Assistente IA" />
                  <Toggle checked={!!pages['feedbacks']} onChange={v => setPages(p => ({ ...p, feedbacks: v }))} disabled={isInherited} label="Feedbacks" />
                </div>

                {/* YMed Pages */}
                <div className={`space-y-3 ${!portals.ymed ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-700 pb-2 text-sm uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4 text-rose-500" /> Páginas - YMed
                  </h4>
                  <Toggle checked={!!ymedPages['dashboard']} onChange={v => setYmedPages(p => ({ ...p, dashboard: v }))} disabled={isInherited} label="Dashboard YMed" />
                  <Toggle checked={!!ymedPages['pipeline']} onChange={v => setYmedPages(p => ({ ...p, pipeline: v }))} disabled={isInherited} label="Pipeline YMed" />
                  <Toggle checked={!!ymedPages['propostas']} onChange={v => setYmedPages(p => ({ ...p, propostas: v }))} disabled={isInherited} label="Propostas YMed" />
                  <Toggle checked={!!ymedPages['coordenadores']} onChange={v => setYmedPages(p => ({ ...p, coordenadores: v }))} disabled={isInherited} label="Coordenadores YMed" />
                  <Toggle checked={!!ymedPages['busca']} onChange={v => setYmedPages(p => ({ ...p, busca: v }))} disabled={isInherited} label="Busca YMed" />
                  <Toggle checked={!!ymedPages['comite']} onChange={v => setYmedPages(p => ({ ...p, comite: v }))} disabled={isInherited} label="Comitê YMed" />
                  <Toggle checked={!!ymedPages['historico']} onChange={v => setYmedPages(p => ({ ...p, historico: v }))} disabled={isInherited} label="Histórico YMed" />
                  <Toggle checked={!!ymedPages['ia']} onChange={v => setYmedPages(p => ({ ...p, ia: v }))} disabled={isInherited} label="IA YMed" />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-700 pb-2 text-sm uppercase tracking-wider">
                  <Settings className="w-4 h-4 text-purple-500" /> Funções Globais
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <Toggle checked={!!functions['canView']} onChange={v => setFunctions(p => ({ ...p, canView: v }))} disabled={isInherited} label="Visualizar Detalhes" />
                  <Toggle checked={!!functions['canEdit']} onChange={v => setFunctions(p => ({ ...p, canEdit: v }))} disabled={isInherited} label="Editar/Anexar" />
                  <Toggle checked={!!functions['canVote']} onChange={v => setFunctions(p => ({ ...p, canVote: v }))} disabled={isInherited} label="Votar Pareceres" />
                  <Toggle checked={!!functions['canMove']} onChange={v => setFunctions(p => ({ ...p, canMove: v }))} disabled={isInherited} label="Mover Pipeline" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            <CheckCircle className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
