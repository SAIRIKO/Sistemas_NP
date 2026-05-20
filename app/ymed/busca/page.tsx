"use client";

import { useState, useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, FileSearch } from "lucide-react";

const PHASES = [
 "Todas",
 "Solicitações",
 "Revisão",
 "Aguardando aprovação",
 "Pré-Comitê",
 "Aguardando Comitê",
 "Comitê",
 "Stand By",
 "Propostas Aprovadas",
 "Reprovados",
];
const COORDINATORS = ["Todos", "INSBE", "Alano", "ILHHH", "IJR"];
const STATUSES = ["Todos", "Aprovado", "Em análise", "Recebendo Proposta", "Reprovado", "Standby"];

const AREAS = ["Todas", ...Array.from(new Set(ymedProposals.map((p) => p.area))).sort()];

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

export default function YmedBuscaPage() {
 const [search, setSearch] = useState("");
 const [area, setArea] = useState("Todas");
 const [coordinator, setCoordinator] = useState("Todos");
 const [status, setStatus] = useState("Todos");
 const [phase, setPhase] = useState("Todas");

 const filtered = useMemo(() => {
 return ymedProposals.filter((p) => {
 const matchSearch =
 !search ||
 p.courseName.toLowerCase().includes(search.toLowerCase()) ||
 p.area.toLowerCase().includes(search.toLowerCase()) ||
 p.subarea.toLowerCase().includes(search.toLowerCase());
 const matchArea = area === "Todas" || p.area === area;
 const matchCoord = coordinator === "Todos" || p.coordinator === coordinator;
 const matchStatus = status === "Todos" || p.status === status;
 const matchPhase = phase === "Todas" || p.currentPhase === phase;
 return matchSearch && matchArea && matchCoord && matchStatus && matchPhase;
 });
 }, [search, area, coordinator, status, phase]);

 const hasFilters = search || area !== "Todas" || coordinator !== "Todos" || status !== "Todos" || phase !== "Todas";

 function clearFilters() {
 setSearch("");
 setArea("Todas");
 setCoordinator("Todos");
 setStatus("Todos");
 setPhase("Todas");
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FileSearch className="w-6 h-6 text-rose-600" />
 Busca Avançada
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Filtre propostas por área, coordenador, status e fase
 </p>
 </div>

 {/* Search + Filters */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700">
 <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
 <SlidersHorizontal className="w-4 h-4 text-rose-500" />
 Filtros
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-4">
 <div className="space-y-4">
 {/* Search input */}
 <div className="relative">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 placeholder="Buscar por nome do curso, área ou subárea..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-rose-400 text-sm"
 />
 </div>

 {/* Filter dropdowns */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Área</label>
 <Select value={areaFilter} onValueChange={(v: string | null) => setAreaFilter(v || "Todas")}>
 <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-rose-400 text-sm">
 <SelectValue placeholder="Todas as áreas" />
 </SelectTrigger>
 <SelectContent>
 {AREAS.map((a) => (
 <SelectItem key={a} value={a}>{a}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Coordenador</label>
 <Select value={coordinatorFilter} onValueChange={(v: string | null) => setCoordinatorFilter(v || "Todos")}>
 <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-rose-400 text-sm">
 <SelectValue placeholder="Todos" />
 </SelectTrigger>
 <SelectContent>
 {COORDINATORS.map((c) => (
 <SelectItem key={c} value={c}>{c}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</label>
 <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v || "Todos")}>
 <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-rose-400 text-sm">
 <SelectValue placeholder="Todos" />
 </SelectTrigger>
 <SelectContent>
 {STATUSES.map((s) => (
 <SelectItem key={s} value={s}>{s}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fase</label>
 <Select value={phaseFilter} onValueChange={(v: string | null) => setPhaseFilter(v || "Todas")}>
 <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-rose-400 text-sm">
 <SelectValue placeholder="Todas" />
 </SelectTrigger>
 <SelectContent>
 {PHASES.map((ph) => (
 <SelectItem key={ph} value={ph}>{ph}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Results header */}
 <div className="flex items-center justify-between">
 <p className="text-sm text-slate-600 dark:text-slate-300">
 <span className="font-semibold text-rose-600">{filtered.length}</span>{" "}
 resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
 </p>
 {hasFilters && (
 <button
 onClick={clearFilters}
 className="text-xs text-rose-600 hover:text-rose-800 font-medium underline underline-offset-2"
 >
 Limpar filtros
 </button>
 )}
 </div>

 {/* Results table */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardContent className="p-0">
 {filtered.length === 0 ? (
 <div className="text-center py-16 text-slate-400">
 <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="font-medium">Nenhum resultado encontrado</p>
 <p className="text-xs mt-1">Tente ajustar os filtros de busca</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Curso</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Coordenador</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Área</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fase</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Data</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {filtered.map((p: YMedProposal) => (
 <tr key={p.id} className="hover:bg-rose-50/30 transition-colors group">
 <td className="px-6 py-3.5">
 <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-rose-700 transition-colors max-w-[220px] truncate">
 {p.courseName}
 </p>
 <p className="text-xs text-slate-400 mt-0.5">{p.subarea}</p>
 </td>
 <td className="px-4 py-3.5">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
 {p.coordinator}
 </span>
 </td>
 <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{p.area}</td>
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
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
