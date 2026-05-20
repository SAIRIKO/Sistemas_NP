"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/lib/store";
import { ProposalCard } from "@/components/ProposalCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
 DropdownMenu,
 DropdownMenuCheckboxItem,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/LoadingStates";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PropostasPage() {
 const { 
 proposals, 
 isProposalsLoading, 
 globalSearchQuery,
 areasFilter, setAreasFilter,
 phasesFilter, setPhasesFilter,
 mastersFilter, setMastersFilter
 } = useAppContext();

 const uniqueAreas = useMemo(() => {
 const areas = new Set(proposals.map(p => p.area).filter(Boolean));
 return Array.from(areas).sort();
 }, [proposals]);

 const uniquePhases = useMemo(() => {
 const phases = new Set(proposals.map(p => p.currentPhase).filter(Boolean));
 return Array.from(phases).sort();
 }, [proposals]);

 const filteredProposals = useMemo(() => {
 return proposals.filter(p => {
 let match = true;
 
 if (globalSearchQuery.trim()) {
 const q = globalSearchQuery.toLowerCase();
 match = match && (
 p.courseName.toLowerCase().includes(q) || 
 p.coordinator.toLowerCase().includes(q)
 );
 }

 if (areasFilter.length > 0 && !areasFilter.includes(p.area)) match = false;
 if (phasesFilter.length > 0 && !phasesFilter.includes(p.currentPhase)) match = false;
 if (mastersFilter.length > 0) {
 const hasMaster = mastersFilter.some(m => p.coordinator.toUpperCase().includes(m));
 if (!hasMaster) match = false;
 }

 return match;
 });
 }, [proposals, globalSearchQuery, areasFilter, phasesFilter, mastersFilter]);

 if (isProposalsLoading && proposals.length === 0) {
 return <TableSkeleton />;
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Todas as Propostas</h2>
 <Button 
 variant="outline" 
 className="gap-2"
 onClick={() => {
 import('@/lib/export').then((module) => {
 module.exportToCSV(filteredProposals);
 toast.success('Relatório exportado com sucesso!');
 });
 }}
 >
 <Download className="h-4 w-4" />
 Exportar CSV
 </Button>
 </div>

 <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
 <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Filtros Avançados</label>
 <div className="text-sm text-slate-500 dark:text-slate-400 py-2">
 Use a busca rápida no menu superior para pesquisar por texto livre.
 </div>
 </div>
 
 <div className="flex flex-col gap-1.5 w-[160px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Área</label>
 <DropdownMenu>
 <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-slate-900 dark:text-white w-full h-9 px-3 py-2 font-normal text-slate-600 dark:text-slate-300">
 {areasFilter.length === 0 ? "Todas" : `${areasFilter.length} selecionada(s)`}
 <ChevronDown className="h-4 w-4 opacity-50" />
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-56" align="start">
 <DropdownMenuGroup>
 <DropdownMenuLabel>Filtrar por Área</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <div className="max-h-60 overflow-y-auto">
 {uniqueAreas.map(a => (
 <DropdownMenuCheckboxItem
 key={a}
 checked={areasFilter.includes(a)}
 onCheckedChange={(checked) => {
 setAreasFilter(prev => checked ? [...prev, a] : prev.filter(x => x !== a));
 }}
 >
 {a}
 </DropdownMenuCheckboxItem>
 ))}
 </div>
 </DropdownMenuGroup>
 {areasFilter.length > 0 && (
 <>
 <DropdownMenuSeparator />
 <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setAreasFilter([])} className="justify-center text-red-600 font-medium cursor-pointer">
 Limpar filtro
 </DropdownMenuCheckboxItem>
 </>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="flex flex-col gap-1.5 w-[180px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Fase</label>
 <DropdownMenu>
 <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-slate-900 dark:text-white w-full h-9 px-3 py-2 font-normal text-slate-600 dark:text-slate-300">
 {phasesFilter.length === 0 ? "Todas" : `${phasesFilter.length} selecionada(s)`}
 <ChevronDown className="h-4 w-4 opacity-50" />
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-64" align="start">
 <DropdownMenuGroup>
 <DropdownMenuLabel>Filtrar por Fase</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <div className="max-h-60 overflow-y-auto">
 {uniquePhases.map(f => (
 <DropdownMenuCheckboxItem
 key={f}
 checked={phasesFilter.includes(f)}
 onCheckedChange={(checked) => {
 setPhasesFilter(prev => checked ? [...prev, f] : prev.filter(x => x !== f));
 }}
 >
 {f}
 </DropdownMenuCheckboxItem>
 ))}
 </div>
 </DropdownMenuGroup>
 {phasesFilter.length > 0 && (
 <>
 <DropdownMenuSeparator />
 <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setPhasesFilter([])} className="justify-center text-red-600 font-medium cursor-pointer">
 Limpar filtro
 </DropdownMenuCheckboxItem>
 </>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="flex flex-col gap-1.5 w-[140px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Master</label>
 <DropdownMenu>
 <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-slate-900 dark:text-white w-full h-9 px-3 py-2 font-normal text-slate-600 dark:text-slate-300">
 {mastersFilter.length === 0 ? "Todos" : `${mastersFilter.length} selecionado(s)`}
 <ChevronDown className="h-4 w-4 opacity-50" />
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-40" align="start">
 <DropdownMenuGroup>
 <DropdownMenuLabel>Filtrar por Master</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <div className="max-h-60 overflow-y-auto">
 {["INSBE", "IJR"].map(m => (
 <DropdownMenuCheckboxItem
 key={m}
 checked={mastersFilter.includes(m)}
 onCheckedChange={(checked) => {
 setMastersFilter(prev => checked ? [...prev, m] : prev.filter(x => x !== m));
 }}
 >
 {m}
 </DropdownMenuCheckboxItem>
 ))}
 </div>
 </DropdownMenuGroup>
 {mastersFilter.length > 0 && (
 <>
 <DropdownMenuSeparator />
 <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setMastersFilter([])} className="justify-center text-red-600 font-medium cursor-pointer">
 Limpar filtro
 </DropdownMenuCheckboxItem>
 </>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 px-2">Resultados da Busca ({filteredProposals.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
 {filteredProposals.map(proposal => (
 <ProposalCard key={proposal.id} proposal={proposal} />
 ))}
 {filteredProposals.length === 0 && (
 <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
 Nenhuma proposta encontrada com os filtros selecionados.
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
