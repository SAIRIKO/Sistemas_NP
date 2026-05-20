"use client";

import { use, useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, User, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

const COORD_META: Record<string, { fullName: string; color: string; bg: string; text: string }> = {
 INSBE: {
 fullName: "Instituto Nacional de Saúde Baseada em Evidências",
 color: "from-rose-500 to-rose-700",
 bg: "bg-rose-50",
 text: "text-rose-700",
 },
 Alano: {
 fullName: "Coordenação Alano",
 color: "from-orange-500 to-rose-600",
 bg: "bg-orange-50",
 text: "text-orange-700",
 },
 ILHHH: {
 fullName: "Instituto de Liderança e Humanidades em Saúde",
 color: "from-pink-500 to-rose-700",
 bg: "bg-pink-50",
 text: "text-pink-700",
 },
 IJR: {
 fullName: "Instituto Júnior de Residentes",
 color: "from-red-600 to-rose-800",
 bg: "bg-red-50",
 text: "text-red-700",
 },
};

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

export default function YmedCoordinatorProfilePage({
 params,
}: {
 params: Promise<{ name: string }>;
}) {
 const { name } = use(params);
 const coordName = decodeURIComponent(name);
 const meta = COORD_META[coordName];

 const proposals = useMemo(
 () => ymedProposals.filter((p) => p.coordinator === coordName),
 [coordName]
 );

 const approved = proposals.filter((p) => p.status === "Aprovado").length;
 const inAnalysis = proposals.filter((p) => p.status === "Em análise").length;
 const reprovado = proposals.filter((p) => p.status === "Reprovado").length;

 if (!meta) {
 return (
 <div className="text-center py-24 text-slate-400">
 <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
 <p className="text-lg font-semibold">Coordenador não encontrado</p>
 <Link href="/ymed/coordenadores" className="mt-4 inline-block text-rose-600 hover:underline text-sm">
 ← Voltar
 </Link>
 </div>
 );
 }

 return (
 <div className="space-y-6 max-w-4xl mx-auto">
 {/* Back */}
 <Link
 href="/ymed/coordenadores"
 className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Voltar para Coordenadores
 </Link>

 {/* Profile header */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
 <div className={`h-24 bg-gradient-to-r ${meta.color} relative`}>
 <div className="absolute -bottom-8 left-6">
 <div className={`w-16 h-16 rounded-2xl ${meta.bg} border-4 border-white flex items-center justify-center shadow-md`}>
 <span className={`text-2xl font-extrabold ${meta.text}`}>
 {coordName.charAt(0)}
 </span>
 </div>
 </div>
 </div>
 <CardContent className="pt-12 pb-6 px-6">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{coordName}</h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{meta.fullName}</p>
 </div>
 <div className="flex gap-4 text-center">
 <div>
 <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{proposals.length}</p>
 <p className="text-xs text-slate-400">Total</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-emerald-600">{approved}</p>
 <p className="text-xs text-slate-400">Aprovadas</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-amber-600">{inAnalysis}</p>
 <p className="text-xs text-slate-400">Em análise</p>
 </div>
 <div>
 <p className="text-2xl font-bold text-rose-600">{reprovado}</p>
 <p className="text-xs text-slate-400">Reprovadas</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Proposals list */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-3">
 <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
 <FileText className="w-4 h-4 text-rose-500" />
 Propostas de {coordName}
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 {proposals.length === 0 ? (
 <div className="text-center py-16 text-slate-400">
 <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
 <p className="font-medium text-sm">Nenhuma proposta encontrada</p>
 </div>
 ) : (
 <div className="divide-y divide-slate-50">
 {proposals.map((p: YMedProposal) => (
 <div
 key={p.id}
 className="flex items-center justify-between px-6 py-4 hover:bg-rose-50/30 transition-colors group"
 >
 <div className="flex-1 min-w-0 mr-4">
 <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-rose-700 transition-colors text-sm truncate">
 {p.courseName}
 </p>
 <div className="flex items-center gap-3 mt-1 flex-wrap">
 <span className="text-xs text-slate-500 dark:text-slate-400">{p.area}</span>
 <span className="text-xs text-slate-300">·</span>
 <span className="text-xs text-slate-500 dark:text-slate-400">{p.subarea}</span>
 <span className="text-xs text-slate-300">·</span>
 <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
 {p.currentPhase}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 <StatusBadge status={p.status} />
 <span className="text-xs text-slate-400 hidden sm:block">
 {new Date(p.requestDate).toLocaleDateString("pt-BR")}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
