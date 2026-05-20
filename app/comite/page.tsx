"use client";

import { useAppContext } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/Badges";
import { User } from "lucide-react";
import Link from "next/link";

export default function ComitePage() {
 const { proposals, role } = useAppContext();
 const comiteProposals = proposals.filter(p => p.currentPhase === 'Comitê' || p.currentPhase === 'Aguardando Comitê');
 const [selectedId, setSelectedId] = useState<string | null>(comiteProposals[0]?.id || null);

 const selected = proposals.find(p => p.id === selectedId);

 return (
 <div className="flex flex-col h-full bg-slate-900 -mx-8 -my-8 p-8 -mt-24 pt-28 min-h-screen text-slate-100">
 <div className="mb-8">
 <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
 <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
 Modo Comitê (Apresentação)
 </h2>
 <p className="text-slate-400 mt-1">Visão focada para leitura em reunião com a diretoria.</p>
 </div>

 <div className="flex flex-1 gap-6">
 {/* SIDEBAR DA PAUTA */}
 <div className="w-80 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
 <div className="p-4 border-b border-slate-700 bg-slate-800/50">
 <h3 className="font-semibold text-slate-200">Pauta do Dia ({comiteProposals.length})</h3>
 </div>
 <div className="flex-1 overflow-y-auto p-2 space-y-1">
 {comiteProposals.map(p => (
 <button 
 key={p.id}
 onClick={() => setSelectedId(p.id)}
 className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedId === p.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-700 text-slate-300'}`}
 >
 <div className="font-medium truncate">{p.courseName}</div>
 <div className="text-xs opacity-70 mt-1 flex justify-between">
 <span>{p.coordinator}</span>
 <span>{p.currentPhase}</span>
 </div>
 </button>
 ))}
 </div>
 </div>

 {/* ALVO PRINCIPAL */}
 <div className="flex-1">
 {selected ? (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* FICHA EXECUTIVA */}
 <Card className="lg:col-span-2 bg-slate-800 border-slate-700 text-slate-200">
 <CardHeader className="border-b border-slate-700 pb-4">
 <div className="flex justify-between items-start">
 <div>
 <CardTitle className="text-2xl text-white">{selected.courseName}</CardTitle>
 <div className="text-slate-400 text-sm mt-2">{selected.area} • {selected.subarea} • Coord: {selected.coordinator}</div>
 </div>
 <RiskBadge risk={selected.cannibalizationRisk} />
 </div>
 </CardHeader>
 <CardContent className="pt-6 space-y-6">
 <div>
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Resumo Executivo</h4>
 <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg">{selected.observations || 'Nenhum resumo adicionado à proposta.'}</p>
 </div>
 
 {selected.courseCoordinators && (
 <div>
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Coordenadores que coordenarão os cursos</h4>
 <div className="flex flex-wrap gap-2">
 {selected.courseCoordinators.split(',').map((name, i) => (
 <Link 
 key={i} 
 href={`/coordenadores/${encodeURIComponent(name.trim())}`}
 className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500 transition-colors group cursor-pointer"
 >
 <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
 <User className="w-3 h-3" />
 </div>
 <span className="text-sm text-slate-200">{name.trim()}</span>
 </Link>
 ))}
 </div>
 </div>
 )}

 <div className="grid grid-cols-2 gap-4">
 <div className="bg-slate-900/50 p-4 rounded-lg">
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Público Alvo</h4>
 <p className="text-sm text-slate-300">{selected.targetAudience || 'Não informado.'}</p>
 </div>
 <div className="bg-slate-900/50 p-4 rounded-lg">
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Disciplinas</h4>
 <p className="text-sm text-slate-300 whitespace-pre-wrap">{selected.disciplines || 'Não descritas.'}</p>
 </div>
 <div className="bg-slate-900/50 p-4 rounded-lg">
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Maior Similaridade</h4>
 {selected.maxSimilarity ? (
 <>
 <div className="text-3xl font-bold text-amber-500">{selected.maxSimilarity}%</div>
 <div className="text-xs text-slate-400 mt-1">Risco: {selected.cannibalizationRisk}</div>
 </>
 ) : (
 <div className="text-slate-400 text-sm">Não calculada</div>
 )}
 </div>
 <div className="bg-slate-900/50 p-4 rounded-lg">
 <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Parecer Pré-Comitê</h4>
 <p className="text-sm text-slate-300">{selected.preCommitteeOpinion || 'Nenhum parecer.'}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* AÇÕES DE COMITÊ */}
 <div className="space-y-6">
 <Card className="bg-slate-800 border-slate-700 text-slate-200">
 <CardHeader>
 <CardTitle className="text-lg text-white">Votação</CardTitle>
 </CardHeader>
 <CardContent>
 {role === 'Diretor' ? (
 <div className="space-y-3">
 <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">Aprovar Proposta</button>
 <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Reprovar Proposta</button>
 <button className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">Stand By / Postergar</button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700 border-dashed">Aguardando votos da diretoria.</div>
 <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">Consolidar Decisão (Admin)</button>
 </div>
 )}
 </CardContent>
 </Card>
 <Card className="bg-slate-800 border-slate-700 text-slate-200">
 <CardHeader>
 <CardTitle className="text-lg text-white">
 Material de Apoio
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <button className="w-full py-2 border border-slate-600 hover:bg-slate-700 text-white rounded font-medium text-sm transition-colors">Abrir Apresentação (PPT)</button>
 <button className="w-full py-2 border border-slate-600 hover:bg-slate-700 text-white rounded font-medium text-sm transition-colors">Reproduzir Vídeo Pitch</button>
 </CardContent>
 </Card>
 </div>
 </div>
 ) : (
 <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-800 rounded-xl border border-slate-700 text-lg">Selecione uma proposta na pauta.</div>
 )}
 </div>
 </div>
 </div>
 );
}
