"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAppContext } from "@/lib/store";
import { ProposalCard } from "@/components/ProposalCard";

export default function BuscaPage() {
 const { proposals } = useAppContext();
 const [query, setQuery] = useState("");
 const [filters, setFilters] = useState<Record<string, boolean>>({
 altoRisco: false,
 aguardandoComite: false,
 semSimilaridade: false,
 semParecer: false,
 });

 const toggleFilter = (key: keyof typeof filters) => {
 setFilters(prev => ({ ...prev, [key]: !prev[key] }));
 };

 const filteredProposals = proposals.filter(p => {
 // Text search
 if (query) {
 const lowerQuery = query.toLowerCase();
 const matchText = 
 p.courseName.toLowerCase().includes(lowerQuery) ||
 p.coordinator.toLowerCase().includes(lowerQuery) ||
 p.area.toLowerCase().includes(lowerQuery) ||
 p.currentPhase.toLowerCase().includes(lowerQuery) ||
 (p.targetAudience?.toLowerCase().includes(lowerQuery)) ||
 (p.courseCoordinators?.toLowerCase().includes(lowerQuery)) ||
 (p.observations?.toLowerCase().includes(lowerQuery)) ||
 (p.disciplines?.toLowerCase().includes(lowerQuery)) ||
 (p.similarCourses?.some(s => 
 s.courseName.toLowerCase().includes(lowerQuery) || 
 s.comment?.toLowerCase().includes(lowerQuery)
 ));
 if (!matchText) return false;
 }

 // Toggle filters
 if (filters.altoRisco && p.cannibalizationRisk !== 'alto') return false;
 if (filters.aguardandoComite && p.currentPhase !== 'Aguardando Comitê') return false;
 if (filters.semSimilaridade && p.maxSimilarity !== undefined && p.maxSimilarity !== null) return false;
 if (filters.semParecer && !!p.preCommitteeOpinion) return false;

 return true;
 });

 return (
 <div className="space-y-6 max-w-4xl mx-auto pb-12">
 <div className="text-center space-y-4 py-8">
 <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Busca Avançada Integrada</h2>
 <p className="text-slate-500 dark:text-slate-400">Busque por nome, palavra-chave, coordenador, área, tema, risco, status ou fase...</p>
 <div className="relative max-w-2xl mx-auto">
 <Search className="absolute left-4 top-3.5 h-6 w-6 text-slate-400" />
 <Input 
 type="text" 
 placeholder="Digite sua busca detalhada aqui..." 
 className="pl-14 h-14 text-lg rounded-full shadow-sm bg-white dark:bg-slate-800 focus-visible:ring-blue-600 focus-visible:border-blue-600" 
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 />
 </div>
 </div>

 <div className="flex gap-2 justify-center flex-wrap mb-8">
 <button 
 onClick={() => toggleFilter('altoRisco')}
 className={`px-5 py-2 rounded-full border font-medium text-sm transition-colors cursor-pointer shadow-sm ${filters.altoRisco ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-600 hover:text-blue-600'}`}>
 Requer Atenção (Alto Risco)
 </button>
 <button 
 onClick={() => toggleFilter('aguardandoComite')}
 className={`px-5 py-2 rounded-full border font-medium text-sm transition-colors cursor-pointer shadow-sm ${filters.aguardandoComite ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-600 hover:text-blue-600'}`}>
 Aguardando Comitê
 </button>
 <button 
 onClick={() => toggleFilter('semSimilaridade')}
 className={`px-5 py-2 rounded-full border font-medium text-sm transition-colors cursor-pointer shadow-sm ${filters.semSimilaridade ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-600 hover:text-blue-600'}`}>
 Sem Similaridade Mapeada
 </button>
 <button 
 onClick={() => toggleFilter('semParecer')}
 className={`px-5 py-2 rounded-full border font-medium text-sm transition-colors cursor-pointer shadow-sm ${filters.semParecer ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-600 hover:text-blue-600'}`}>
 Sem Parecer do Pré-Comitê
 </button>
 </div>

 <div className="space-y-4">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 px-2">Resultados da Busca ({filteredProposals.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filteredProposals.map(p => (
 <ProposalCard key={p.id} proposal={p} />
 ))}
 {filteredProposals.length === 0 && (
 <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
 Nenhum resultado encontrado para os filtros selecionados.
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
