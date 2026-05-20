"use client";

import { useAppContext } from "@/lib/store";
import { ProposalCard } from "@/components/ProposalCard";
import { KanbanSkeleton } from "@/components/LoadingStates";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Columns3 } from "lucide-react";

const PHASES = [
 "Solicitações",
 "Revisão",
 "Aguardando aprovação",
 "Reservas Aprovadas (INSBE)",
 "Reservas Aprovadas",
 "(Controle Interno) Inserir Performance",
 "Pré-Comitê",
 "Aguardando Comitê",
 "Comitê",
 "Stand By",
 "Propostas Aprovadas",
 "Reprovados"
];

export default function PipelinePage() {
 const { proposals, setProposals, isProposalsLoading, globalSearchQuery } = useAppContext();
 const [isDragging, setIsDragging] = useState(false);
 const [activePhase, setActivePhase] = useState<string | null>(null);
 const [localSearch, setLocalSearch] = useState("");

 const filteredProposals = useMemo(() => {
 const q = (localSearch || globalSearchQuery).toLowerCase();
 if (!q.trim()) return proposals;
 return proposals.filter(p => 
 p.courseName.toLowerCase().includes(q) || 
 p.coordinator.toLowerCase().includes(q)
 );
 }, [proposals, globalSearchQuery, localSearch]);

 const phaseMap = useMemo(() => {
 const map: Record<string, typeof proposals> = {};
 PHASES.forEach((ph) => {
 map[ph] = filteredProposals.filter((p) => p.currentPhase === ph);
 });
 return map;
 }, [filteredProposals]);

 const handleDragStart = (e: React.DragEvent, proposalId: string) => {
 e.dataTransfer.setData("proposalId", proposalId);
 setIsDragging(true);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault(); // Necessário para permitir o drop
 };

 const handleDrop = async (e: React.DragEvent, targetPhase: string) => {
 e.preventDefault();
 setIsDragging(false);
 const proposalId = e.dataTransfer.getData("proposalId");
 
 if (!proposalId) return;

 const originalProposals = [...proposals];
 const proposal = proposals.find(p => p.id === proposalId);
 if (!proposal || proposal.currentPhase === targetPhase) return;

 // Atualização otimista
 const updatedProposals = proposals.map(p => 
 p.id === proposalId ? { ...p, currentPhase: targetPhase } : p
 );
 setProposals(updatedProposals);
 
 const loadingToast = toast.loading("Movendo card no Pipefy...");

 try {
 const res = await fetch(`/api/pipefy/cards/${proposalId}/move`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ targetPhase })
 });

 if (!res.ok) throw new Error("Falha na API");
 
 toast.success("Card movido com sucesso no Pipefy!", { id: loadingToast });
 } catch (err) {
 console.error(err);
 setProposals(originalProposals); // Reverte no erro
 toast.error("Erro ao mover o card. Tente novamente.", { id: loadingToast });
 }
 };

 if (isProposalsLoading && proposals.length === 0) {
 return <KanbanSkeleton />;
 }

 return (
 <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] overflow-hidden -mt-4 md:-mt-8">
 <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Columns3 className="w-6 h-6 text-[#7f1342]" />
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
 value={localSearch}
 onChange={(e) => setLocalSearch(e.target.value)}
 className="pl-9 h-9 rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#7f1342]"
 />
 </div>
 </div>

 {/* Phase filter pills */}
 <div className="flex flex-wrap gap-2 mb-4 shrink-0">
 <button
 onClick={() => setActivePhase(null)}
 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
 activePhase === null
 ? "bg-[#7f1342] text-white shadow-sm"
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
 ? "bg-[#7f1342] text-white shadow-sm"
 : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
 }`}
 >
 {ph}
 {phaseMap[ph].length > 0 && (
 <span className={`inline-flex w-4 h-4 items-center justify-center rounded-full text-[10px] font-bold ${
 activePhase === ph ? "bg-white dark:bg-slate-800 text-[#7f1342]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
 }`}>
 {phaseMap[ph].length}
 </span>
 )}
 </button>
 ))}
 </div>

 <div className="flex flex-1 gap-6 overflow-x-auto pb-4 snap-x min-h-0">
 {PHASES.filter((ph) => activePhase === null || ph === activePhase).map(phase => {
 const phaseProposals = phaseMap[phase];
 return (
 <div key={phase} className="min-w-[320px] w-[320px] h-full snap-center flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
 <div className="p-3 border-b border-[#7f1342] bg-[#7f1342] text-white flex justify-between items-center">
 <h3 className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis mr-2" title={phase}>{phase}</h3>
 <span className="bg-white dark:bg-slate-800 text-[#7f1342] text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-bold border shadow-sm shrink-0">
 {phaseProposals.length}
 </span>
 </div>
 <div 
 className={`flex-1 p-3 overflow-y-auto no-scrollbar transition-colors space-y-3 ${isDragging ? "bg-slate-200 dark:bg-slate-800/50" : ""}`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, phase)}
 >
 {phaseProposals.map(proposal => (
 <div 
 key={proposal.id} 
 draggable 
 onDragStart={(e) => handleDragStart(e, proposal.id)}
 onDragEnd={() => setIsDragging(false)}
 className="cursor-grab active:cursor-grabbing"
 >
 <ProposalCard proposal={proposal} hrefOverride={`/pipeline/card/${proposal.id}`} />
 </div>
 ))}
 {phaseProposals.length === 0 && (
 <div className="h-24 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
 Nenhum card
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
