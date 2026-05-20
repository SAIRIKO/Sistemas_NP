"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/lib/store";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
 DropdownMenu,
 DropdownMenuCheckboxItem,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, ListFilter, FileText, ChevronDown } from "lucide-react";

const COORDINATORS = ["Todos", "INSBE", "Alano", "ILHHH", "IJR"];

function StatusBadge({ status }: { status: string }) {
 const map: Record<string, string> = {
 Aprovado: "bg-emerald-100 text-emerald-700 border-emerald-200",
 "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
 "Recebendo Proposta": "bg-sky-100 text-sky-700 border-sky-200",
 Reprovado: "bg-rose-100 text-rose-700 border-rose-200",
 Standby: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
 };
 const cls = map[status] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
 {status}
 </span>
 );
}

export default function YmedPropostasPage() {
 const { 
 globalSearchQuery: search, 
 setGlobalSearchQuery: setSearch, 
 ymedCoordinatorsFilter: coordinators, 
 setYmedCoordinatorsFilter: setCoordinators 
 } = useAppContext();

 const filtered = useMemo(() => {
 return ymedProposals.filter((p) => {
 const matchSearch =
 !search ||
 p.courseName.toLowerCase().includes(search.toLowerCase()) ||
 p.area.toLowerCase().includes(search.toLowerCase());
 const matchCoord = coordinators.length === 0 || coordinators.includes(p.coordinator) || coordinators.includes("Todos");
 return matchSearch && matchCoord;
 });
 }, [search, coordinators]);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FileText className="w-6 h-6 text-rose-600" />
 Propostas YMed
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Lista completa de propostas de cursos médicos
 </p>
 </div>

 {/* Filters */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardContent className="pt-4 pb-4">
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 placeholder="Buscar por curso ou área..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-rose-400"
 />
 </div>
 <div className="flex items-center gap-2">
 <ListFilter className="w-4 h-4 text-slate-400 shrink-0" />
 <DropdownMenu>
 <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-slate-900 dark:text-white w-48 h-9 px-3 py-2 font-normal text-slate-600 dark:text-slate-300">
 {coordinators.length === 0 ? "Coordenador" : `${coordinators.length} selecionado(s)`}
 <ChevronDown className="h-4 w-4 opacity-50" />
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-48" align="start">
 <DropdownMenuGroup>
 <DropdownMenuLabel>Coordenador</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <div className="max-h-60 overflow-y-auto">
 {COORDINATORS.filter(c => c !== "Todos").map(c => (
 <DropdownMenuCheckboxItem
 key={c}
 checked={coordinators.includes(c)}
 onCheckedChange={(checked) => {
 setCoordinators(prev => checked ? [...prev, c] : prev.filter(x => x !== c));
 }}
 >
 {c}
 </DropdownMenuCheckboxItem>
 ))}
 </div>
 </DropdownMenuGroup>
 {coordinators.length > 0 && (
 <>
 <DropdownMenuSeparator />
 <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setCoordinators([])} className="justify-center text-rose-600 font-medium cursor-pointer">
 Limpar filtro
 </DropdownMenuCheckboxItem>
 </>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Summary pills */}
 <div className="flex flex-wrap gap-2 text-xs">
 <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
 {filtered.length} proposta{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
 </span>
 {["Aprovado", "Em análise", "Reprovado", "Recebendo Proposta"].map((s) => {
 const count = filtered.filter((p) => p.status === s).length;
 if (!count) return null;
 return (
 <span key={s} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
 {s}: {count}
 </span>
 );
 })}
 </div>

 {/* Table */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="pb-0 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
 <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 py-1">
 Todas as Propostas
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 {filtered.length === 0 ? (
 <div className="text-center py-16 text-slate-400">
 <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="font-medium">Nenhuma proposta encontrada</p>
 <p className="text-xs mt-1">Tente ajustar os filtros de busca</p>
 </div>
 ) : (
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700">
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Curso
 </th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Coordenador
 </th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Área
 </th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Fase
 </th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Status
 </th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
 Data
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {filtered.map((p: YMedProposal) => (
 <tr
 key={p.id}
 className="hover:bg-rose-50/30 transition-colors group"
 >
 <td className="px-6 py-3.5">
 <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-rose-700 transition-colors max-w-[240px] truncate">
 {p.courseName}
 </p>
 <p className="text-xs text-slate-400 mt-0.5">{p.subarea}</p>
 </td>
 <td className="px-4 py-3.5">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
 {p.coordinator}
 </span>
 </td>
 <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-sm">{p.area}</td>
 <td className="px-4 py-3.5">
 <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
 {p.currentPhase}
 </span>
 </td>
 <td className="px-4 py-3.5">
 <StatusBadge status={p.status} />
 </td>
 <td className="px-4 py-3.5 text-slate-400 text-xs">
 {new Date(p.requestDate).toLocaleDateString("pt-BR")}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
