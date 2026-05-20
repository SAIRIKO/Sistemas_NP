"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Proposal, CoordinatorProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CoordinatorStats {
 name: string;
 totalProjects: number;
 approved: number;
 inAnalysis: number;
 proposals: Proposal[];
 profile?: CoordinatorProfile;
}

export default function CoordenadoresPage() {
 const { proposals, coordinatorProfiles, globalSearchQuery } = useAppContext();
 const [searchQuery, setSearchQuery] = useState("");
 const [hasProjectFilter, setHasProjectFilter] = useState("all");
 const [masterFilter, setMasterFilter] = useState("all");

 const coordinators = useMemo(() => {
 const statsMap = new Map<string, CoordinatorStats>();

 // Função auxiliar para registrar propostas para um coordenador
 const registerProposal = (coordName: string, proposal: Proposal) => {
 if (!coordName || coordName === "Não definido") return;
 
 const normalizedName = coordName.trim();
 if (!statsMap.has(normalizedName)) {
 const profile = coordinatorProfiles?.find(p => p.name.toLowerCase() === normalizedName.toLowerCase());
 statsMap.set(normalizedName, {
 name: normalizedName,
 totalProjects: 0,
 approved: 0,
 inAnalysis: 0,
 proposals: [],
 profile
 });
 }

 const stat = statsMap.get(normalizedName)!;
 // Evitar duplicidade caso ele seja coordenador principal e de curso na mesma proposta
 if (!stat.proposals.some(p => p.id === proposal.id)) {
 stat.totalProjects += 1;
 if (proposal.status === 'Aprovado') stat.approved += 1;
 if (proposal.status === 'Em análise') stat.inAnalysis += 1;
 stat.proposals.push(proposal);
 }
 };

 proposals.forEach(p => {
 // Coordenador principal
 registerProposal(p.coordinator, p);

 // Coordenadores de curso adicionais (separados por vírgula)
 if (p.courseCoordinators) {
 const coords = p.courseCoordinators.split(',').map(c => c.trim());
 coords.forEach(c => registerProposal(c, p));
 }
 });

 // Injetar coordenadores da base que não possuem propostas
 coordinatorProfiles?.forEach(profile => {
 const normalizedName = profile.name.trim();
 const exists = Array.from(statsMap.keys()).some(k => k.toLowerCase() === normalizedName.toLowerCase());
 
 if (!exists && normalizedName && normalizedName !== "Não definido") {
 statsMap.set(normalizedName, {
 name: normalizedName,
 totalProjects: 0,
 approved: 0,
 inAnalysis: 0,
 proposals: [],
 profile
 });
 }
 });

 return Array.from(statsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
 }, [proposals, coordinatorProfiles]);

 const filteredCoordinators = useMemo(() => {
 let result = coordinators;
 
 // Combinar busca local com busca global do header
 const effectiveQuery = (searchQuery || globalSearchQuery || "").trim();
 if (effectiveQuery) {
 const query = effectiveQuery.toLowerCase();
 result = result.filter(c => 
 c.name.toLowerCase().includes(query) || 
 c.proposals.some(p => p.courseName.toLowerCase().includes(query))
 );
 }
 
 if (hasProjectFilter === "yes") {
 result = result.filter(c => c.totalProjects > 0);
 } else if (hasProjectFilter === "no") {
 result = result.filter(c => c.totalProjects === 0);
 }

 if (masterFilter === "INSBE") {
 result = result.filter(c => c.name.toUpperCase().includes("INSBE"));
 } else if (masterFilter === "IJR") {
 result = result.filter(c => c.name.toUpperCase().includes("IJR"));
 }

 return result;
 }, [coordinators, searchQuery, globalSearchQuery, hasProjectFilter, masterFilter]);

 const activeCoordinators = filteredCoordinators.filter(c => c.totalProjects > 0);
 const inactiveCoordinators = filteredCoordinators.filter(c => c.totalProjects === 0);

 const renderCard = (coord: CoordinatorStats) => (
 <Link href={`/coordenadores/${encodeURIComponent(coord.name)}`} key={coord.name}>
 <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200 dark:border-slate-700 group h-full flex flex-col">
 <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
 <User className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={coord.name}>
 {coord.name}
 </h3>
 {coord.profile?.isCurrentCoordinator && (
 <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 text-[10px] px-1.5 py-0 uppercase tracking-wider font-bold">Unyleya</Badge>
 )}
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ver perfil completo</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
 </div>
 
 {coord.profile?.bio && (
 <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{coord.profile.bio}</p>
 )}
 
 <div className="grid grid-cols-3 gap-2 border-t pt-4 border-slate-100 dark:border-slate-700 mt-auto">
 <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
 <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-1" />
 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{coord.totalProjects}</span>
 <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider">Projetos</span>
 </div>
 <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
 <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mb-1" />
 <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{coord.approved}</span>
 <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-500 tracking-wider">Aprovados</span>
 </div>
 <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
 <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mb-1" />
 <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{coord.inAnalysis}</span>
 <span className="text-[10px] uppercase text-blue-600 dark:text-blue-500 tracking-wider">Análise</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </Link>
 );

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Coordenadores</h2>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
 Gestão e acompanhamento de coordenadores e seus projetos.
 </p>
 </div>
 
 <div className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
 <div className="flex flex-col gap-1.5 w-full sm:w-80">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Busca</label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <Input 
 placeholder="Nome ou curso..." 
 className="pl-9 bg-white dark:bg-transparent w-full h-9"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 
 <div className="flex flex-col gap-1.5 w-full sm:w-auto">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Master</label>
 <Select value={masterFilter} onValueChange={(v: string | null) => setMasterFilter(v || "all")}>
 <SelectTrigger className="w-full sm:w-[130px] bg-white dark:bg-transparent dark:border-slate-700 h-9 border-slate-200 dark:border-slate-700">
 <SelectValue placeholder="Master" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Master</SelectItem>
 <SelectItem value="INSBE">INSBE</SelectItem>
 <SelectItem value="IJR">IJR</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="flex flex-col gap-1.5 w-full sm:w-auto">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Status</label>
 <Select value={hasProjectFilter} onValueChange={setHasProjectFilter}>
 <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-transparent dark:border-slate-700 h-9 border-slate-200 dark:border-slate-700">
 <SelectValue placeholder="Tem projeto?" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Status</SelectItem>
 <SelectItem value="yes">Com projeto</SelectItem>
 <SelectItem value="no">Sem projeto</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {activeCoordinators.length > 0 && (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {activeCoordinators.map(coord => renderCard(coord))}
 </div>
 )}

 {inactiveCoordinators.length > 0 && (
 <div className="mt-12 space-y-6">
 <div className="flex items-center gap-4">
 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
 <h3 className="font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Coordenadores sem propostas</h3>
 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80">
 {inactiveCoordinators.map(coord => renderCard(coord))}
 </div>
 </div>
 )}

 {filteredCoordinators.length === 0 && (
 <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
 <Search className="w-8 h-8 text-slate-400" />
 </div>
 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Nenhum coordenador encontrado</h3>
 <p className="text-slate-500 dark:text-slate-400">
 Sua pesquisa por "{searchQuery}" não retornou resultados.<br/>Tente buscar por outro nome ou curso.
 </p>
 </div>
 )}
 </div>
 );
}
