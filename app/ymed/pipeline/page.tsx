"use client";

import { useState, useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Columns3, BookOpen, User } from "lucide-react";

const PHASES = [
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

function statusColor(status: string) {
 const map: Record<string, string> = {
 Aprovado: "bg-emerald-100 text-emerald-700",
 "Em análise": "bg-amber-100 text-amber-700",
 "Recebendo Proposta": "bg-sky-100 text-sky-700",
 Reprovado: "bg-rose-100 text-rose-700",
 Standby: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
 };
 return map[status] ?? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
}

function ProposalCard({ p }: { p: YMedProposal }) {
 return (
 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 shadow-sm hover:shadow-md hover:border-[#1c9a96] transition-all cursor-pointer group">
 <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-[#1c9a96] transition-colors line-clamp-2">
 {p.courseName}
 </p>
 <div className="mt-2.5 flex flex-col gap-1.5">
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <User className="w-3 h-3 text-rose-400 shrink-0" />
 <span>{p.coordinator}</span>
 </div>
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <BookOpen className="w-3 h-3 text-rose-400 shrink-0" />
 <span className="truncate">{p.area}</span>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
 {p.status}
 </span>
 <span className="text-[10px] text-slate-400">
 {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
 </span>
 </div>
 </div>
 );
}

function PhaseColumn({
 phase,
 proposals,
 isActive,
}: {
 phase: string;
 proposals: YMedProposal[];
 isActive: boolean;
}) {
 return (
 <div className="min-w-[320px] w-[320px] h-full snap-center flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
 <div
 className={`p-3 flex items-center justify-between border-b ${
 isActive
 ? "bg-[#1c9a96] border-[#1c9a96] text-white"
 : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
 }`}
 >
 <h3 className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis mr-2" title={phase}>
 {phase}
 </h3>
 <span
 className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border shadow-sm ${
 isActive ? "bg-white dark:bg-slate-800 text-[#1c9a96]" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
 }`}
 >
 {proposals.length}
 </span>
 </div>
 <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-3">
 {proposals.length === 0 ? (
 <div className="h-24 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
 Nenhuma proposta
 </div>
 ) : (
 proposals.map((p) => <ProposalCard key={p.id} p={p} />)
 )}
 </div>
 </div>
 );
}

export default function YmedPipelinePage() {
 const [search, setSearch] = useState("");
 const [activePhase, setActivePhase] = useState<string | null>(null);

 const filtered = useMemo(() => {
 return ymedProposals.filter((p) => {
 const matchSearch =
 !search ||
 p.courseName.toLowerCase().includes(search.toLowerCase()) ||
 p.coordinator.toLowerCase().includes(search.toLowerCase()) ||
 p.area.toLowerCase().includes(search.toLowerCase());
 return matchSearch;
 });
 }, [search]);

 const phaseMap = useMemo(() => {
 const map: Record<string, YMedProposal[]> = {};
 PHASES.forEach((ph) => {
 map[ph] = filtered.filter((p) => p.currentPhase === ph);
 });
 return map;
 }, [filtered]);

 return (
 <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] overflow-hidden -mt-4 md:-mt-8">
 {/* Header */}
 <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Columns3 className="w-6 h-6 text-[#1c9a96]" />
 Pipeline de Propostas
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Visualize e acompanhe as propostas por fase do fluxo
 </p>
 </div>
 <div className="relative w-full sm:w-64">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 placeholder="Buscar proposta..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 h-9 rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#1c9a96]"
 />
 </div>
 </div>

 {/* Phase filter pills */}
 <div className="flex flex-wrap gap-2 mb-4 shrink-0">
 <button
 onClick={() => setActivePhase(null)}
 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
 activePhase === null
 ? "bg-[#1c9a96] text-white shadow-sm"
 : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
 }`}
 >
 Todas as fases
 </button>
 {PHASES.map((ph) => (
 <button
 key={ph}
 onClick={() => setActivePhase(ph === activePhase ? null : ph)}
 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
 activePhase === ph
 ? "bg-[#1c9a96] text-white shadow-sm"
 : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
 }`}
 >
 {ph}
 {phaseMap[ph].length > 0 && (
 <span className={`inline-flex w-4 h-4 items-center justify-center rounded-full text-[10px] font-bold ${
 activePhase === ph ? "bg-white dark:bg-slate-800 text-[#1c9a96]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
 }`}>
 {phaseMap[ph].length}
 </span>
 )}
 </button>
 ))}
 </div>

 {/* Kanban Board */}
 <div className="flex flex-1 gap-6 overflow-x-auto pb-4 snap-x min-h-0">
 {PHASES.filter((ph) => activePhase === null || ph === activePhase).map((phase) => (
 <PhaseColumn
 key={phase}
 phase={phase}
 proposals={phaseMap[phase]}
 isActive={activePhase === phase}
 />
 ))}
 </div>
 </div>
 );
}
