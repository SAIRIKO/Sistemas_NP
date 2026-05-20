"use client";

import { useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Users, ChevronRight, FileText, CheckCircle, Clock } from "lucide-react";

const COORDINATORS = [
 {
 id: "INSBE",
 fullName: "Instituto Nacional de Saúde Baseada em Evidências",
 color: "from-rose-500 to-rose-700",
 textColor: "text-rose-700",
 bgColor: "bg-rose-50",
 borderColor: "border-rose-200",
 badgeColor: "bg-rose-100 text-rose-700",
 },
 {
 id: "Alano",
 fullName: "Coordenação Alano",
 color: "from-orange-500 to-rose-600",
 textColor: "text-orange-700",
 bgColor: "bg-orange-50",
 borderColor: "border-orange-200",
 badgeColor: "bg-orange-100 text-orange-700",
 },
 {
 id: "ILHHH",
 fullName: "Instituto de Liderança e Humanidades em Saúde",
 color: "from-pink-500 to-rose-700",
 textColor: "text-pink-700",
 bgColor: "bg-pink-50",
 borderColor: "border-pink-200",
 badgeColor: "bg-pink-100 text-pink-700",
 },
 {
 id: "IJR",
 fullName: "Instituto Júnior de Residentes",
 color: "from-red-600 to-rose-800",
 textColor: "text-red-700",
 bgColor: "bg-red-50",
 borderColor: "border-red-200",
 badgeColor: "bg-red-100 text-red-700",
 },
];

export default function YmedCoordenaoresPage() {
 const stats = useMemo(() => {
 return COORDINATORS.map((c) => {
 const proposals = ymedProposals.filter((p) => p.coordinator === c.id);
 const approved = proposals.filter((p) => p.status === "Aprovado").length;
 const inProgress = proposals.filter((p) => p.status === "Em análise").length;
 return { ...c, total: proposals.length, approved, inProgress };
 });
 }, []);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Users className="w-6 h-6 text-rose-600" />
 Coordenadores YMed
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Gerencie e visualize as propostas por coordenador
 </p>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
 {stats.map((c) => (
 <Link key={c.id} href={`/ymed/coordenadores/${c.id}`}>
 <Card className={`border ${c.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden h-full`}>
 {/* Header gradient */}
 <div className={`h-2 w-full bg-gradient-to-r ${c.color}`} />
 <CardContent className="pt-5 pb-5">
 <div className="flex items-start justify-between">
 <div className={`w-12 h-12 rounded-xl ${c.bgColor} flex items-center justify-center shrink-0`}>
 <span className={`text-lg font-extrabold ${c.textColor}`}>
 {c.id.charAt(0)}
 </span>
 </div>
 <ChevronRight className={`w-4 h-4 ${c.textColor} opacity-0 group-hover:opacity-100 transition-opacity mt-1`} />
 </div>

 <div className="mt-4">
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.id}</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
 {c.fullName}
 </p>
 </div>

 {/* Stats */}
 <div className="mt-5 grid grid-cols-3 gap-2">
 <div className="text-center">
 <div className="flex items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 mb-0.5">
 <FileText className="w-3 h-3" />
 </div>
 <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{c.total}</p>
 <p className="text-[10px] text-slate-400">Total</p>
 </div>
 <div className="text-center">
 <div className="flex items-center justify-center gap-0.5 text-emerald-500 mb-0.5">
 <CheckCircle className="w-3 h-3" />
 </div>
 <p className="text-xl font-bold text-emerald-600">{c.approved}</p>
 <p className="text-[10px] text-slate-400">Aprovadas</p>
 </div>
 <div className="text-center">
 <div className="flex items-center justify-center gap-0.5 text-amber-500 mb-0.5">
 <Clock className="w-3 h-3" />
 </div>
 <p className="text-xl font-bold text-amber-600">{c.inProgress}</p>
 <p className="text-[10px] text-slate-400">Em andamento</p>
 </div>
 </div>

 {/* CTA */}
 <div className={`mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg ${c.bgColor} ${c.textColor} text-xs font-semibold group-hover:opacity-90 transition`}>
 Ver propostas
 <ChevronRight className="w-3.5 h-3.5" />
 </div>
 </CardContent>
 </Card>
 </Link>
 ))}
 </div>

 {/* Summary bar */}
 <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
 <span className="font-semibold text-slate-700 dark:text-slate-200">Resumo Geral:</span>
 {stats.map((c) => (
 <span key={c.id}>
 <span className={`font-bold ${c.textColor}`}>{c.id}</span>: {c.total} proposta{c.total !== 1 ? "s" : ""}
 </span>
 ))}
 </div>
 </div>
 );
}
