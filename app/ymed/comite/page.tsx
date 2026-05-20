"use client";

import { useState } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
 Gavel,
 CheckCircle,
 XCircle,
 User,
 BookOpen,
 Calendar,
 AlertCircle,
} from "lucide-react";

type VoteState = "Aprovado" | "Reprovado" | null;

function ProposalVoteCard({ p }: { p: YMedProposal }) {
 const [vote, setVote] = useState<VoteState>(null);
 const [confirming, setConfirming] = useState<VoteState>(null);

 function handleVote(v: VoteState) {
 if (vote) return;
 setConfirming(v);
 }

 function confirmVote() {
 setVote(confirming);
 setConfirming(null);
 }

 function cancelVote() {
 setConfirming(null);
 }

 return (
 <Card
 className={`border shadow-sm transition-all duration-300 overflow-hidden ${
 vote === "Aprovado"
 ? "border-emerald-300 bg-emerald-50/40"
 : vote === "Reprovado"
 ? "border-rose-300 bg-rose-50/40"
 : "border-slate-200 dark:border-slate-700 hover:shadow-md"
 }`}
 >
 {/* Top accent */}
 <div
 className={`h-1 w-full ${
 vote === "Aprovado"
 ? "bg-emerald-500"
 : vote === "Reprovado"
 ? "bg-rose-500"
 : "bg-gradient-to-r from-rose-400 to-rose-600"
 }`}
 />

 <CardContent className="pt-5 pb-5 px-5">
 {/* Course name */}
 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
 {p.courseName}
 </h3>

 {/* Meta info */}
 <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
 <span>{p.coordinator}</span>
 </div>
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <BookOpen className="w-3.5 h-3.5 text-rose-400 shrink-0" />
 <span>{p.area}</span>
 </div>
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
 <span>{new Date(p.requestDate).toLocaleDateString("pt-BR")}</span>
 </div>
 </div>

 <div className="mt-2">
 <span className="text-xs text-slate-400">Subárea: {p.subarea}</span>
 </div>

 {/* Vote confirmation */}
 {confirming && (
 <div className={`mt-4 p-3 rounded-lg border ${
 confirming === "Aprovado"
 ? "bg-emerald-50 border-emerald-200"
 : "bg-rose-50 border-rose-200"
 }`}>
 <p className={`text-sm font-medium mb-2 ${
 confirming === "Aprovado" ? "text-emerald-800" : "text-rose-800"
 }`}>
 Confirmar {confirming === "Aprovado" ? "aprovação" : "reprovação"} desta proposta?
 </p>
 <div className="flex gap-2">
 <Button
 size="sm"
 onClick={confirmVote}
 className={`text-xs h-7 px-3 ${
 confirming === "Aprovado"
 ? "bg-emerald-600 hover:bg-emerald-700 text-white"
 : "bg-rose-600 hover:bg-rose-700 text-white"
 }`}
 >
 Confirmar
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={cancelVote}
 className="text-xs h-7 px-3 text-slate-500 dark:text-slate-400"
 >
 Cancelar
 </Button>
 </div>
 </div>
 )}

 {/* Result */}
 {vote && (
 <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-lg ${
 vote === "Aprovado"
 ? "bg-emerald-100 text-emerald-700"
 : "bg-rose-100 text-rose-700"
 }`}>
 {vote === "Aprovado" ? (
 <CheckCircle className="w-4 h-4 shrink-0" />
 ) : (
 <XCircle className="w-4 h-4 shrink-0" />
 )}
 <span className="text-sm font-semibold">
 Proposta {vote === "Aprovado" ? "Aprovada" : "Reprovada"}
 </span>
 </div>
 )}

 {/* Vote buttons */}
 {!vote && !confirming && (
 <div className="mt-5 flex gap-3">
 <Button
 onClick={() => handleVote("Aprovado")}
 className="flex-1 gap-2 h-9 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
 >
 <CheckCircle className="w-4 h-4" />
 Aprovar
 </Button>
 <Button
 onClick={() => handleVote("Reprovado")}
 variant="outline"
 className="flex-1 gap-2 h-9 text-sm border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400"
 >
 <XCircle className="w-4 h-4" />
 Reprovar
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

export default function YmedComitePage() {
 const inCommittee = ymedProposals.filter((p) => p.currentPhase === "Comitê");

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Gavel className="w-6 h-6 text-rose-600" />
 Comitê YMed
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Propostas em fase de votação no comitê
 </p>
 </div>
 <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200">
 <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
 <span className="text-sm font-semibold text-rose-700">
 {inCommittee.length} proposta{inCommittee.length !== 1 ? "s" : ""} aguardando votação
 </span>
 </div>
 </div>

 {/* Guide */}
 <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-semibold text-amber-800">Atenção — Sessão de Comitê</p>
 <p className="text-xs text-amber-700 mt-0.5">
 Revise cada proposta com atenção. Uma vez registrado, o voto encerra o processo para esta proposta.
 Os resultados serão consolidados e encaminhados para as coordenações.
 </p>
 </div>
 </div>

 {/* Proposals */}
 {inCommittee.length === 0 ? (
 <div className="text-center py-24 text-slate-400">
 <Gavel className="w-16 h-16 mx-auto mb-4 opacity-20" />
 <p className="text-lg font-semibold">Nenhuma proposta em comitê</p>
 <p className="text-sm mt-1">Quando propostas chegarem a esta fase, elas aparecerão aqui.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {inCommittee.map((p: YMedProposal) => (
 <ProposalVoteCard key={p.id} p={p} />
 ))}
 </div>
 )}
 </div>
 );
}
