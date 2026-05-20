"use client";

import { useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { YMedProposal } from "@/lib/ymed-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
 FileText,
 CheckCircle,
 Clock,
 XCircle,
 TrendingUp,
 Activity,
} from "lucide-react";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

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
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
 {status}
 </span>
 );
}

function KpiCard({
 title,
 value,
 icon: Icon,
 color,
 sub,
}: {
 title: string;
 value: number;
 icon: React.ElementType;
 color: string;
 sub: string;
}) {
 return (
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
 <CardContent className="pt-6 pb-4">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
 <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
 <p className="text-xs text-slate-400 mt-1">{sub}</p>
 </div>
 <div className={`p-3 rounded-xl ${color}`}>
 <Icon className="w-5 h-5" />
 </div>
 </div>
 </CardContent>
 </Card>
 );
}

export default function YmedDashboardPage() {
 const proposals = ymedProposals;

 const total = proposals.length;
 const aprovadas = proposals.filter((p) => p.status === "Aprovado").length;
 const emAnalise = proposals.filter((p) => p.status === "Em análise").length;
 const reprovadas = proposals.filter((p) => p.status === "Reprovado").length;

 const phaseData = useMemo(() => {
 const phases = [
 "Solicitações",
 "Revisão",
 "Aguardando aprovação",
 "Comitê",
 "Propostas Aprovadas",
 ];
 return phases.map((phase) => ({
 name: phase.length > 14 ? phase.slice(0, 13) + "…" : phase,
 fullName: phase,
 total: proposals.filter((p) => p.currentPhase === phase).length,
 }));
 }, [proposals]);

 const coordinatorData = useMemo(() => {
 const coords = ["INSBE", "Alano", "ILHHH", "IJR"];
 return coords.map((c) => ({
 name: c,
 total: proposals.filter((p) => p.coordinator === c).length,
 }));
 }, [proposals]);

 const recent = [...proposals]
 .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
 .slice(0, 6);

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard YMed</h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Visão geral das propostas e indicadores do portfólio médico
 </p>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
 <Activity className="w-4 h-4 text-rose-600" />
 <span className="text-xs font-semibold text-rose-600">Ao vivo</span>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiCard
 title="Total de Propostas"
 value={total}
 icon={FileText}
 color="bg-rose-50 text-rose-600"
 sub="Todas as propostas"
 />
 <KpiCard
 title="Aprovadas"
 value={aprovadas}
 icon={CheckCircle}
 color="bg-emerald-50 text-emerald-600"
 sub="Fluxo concluído"
 />
 <KpiCard
 title="Em Análise"
 value={emAnalise}
 icon={Clock}
 color="bg-amber-50 text-amber-600"
 sub="Aguardando decisão"
 />
 <KpiCard
 title="Reprovadas"
 value={reprovadas}
 icon={XCircle}
 color="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
 sub="Encerradas negativamente"
 />
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
 <Card className="col-span-4 border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-rose-500" />
 Propostas por Fase
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={phaseData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis
 dataKey="name"
 axisLine={false}
 tickLine={false}
 tick={{ fontSize: 11, fill: "#94a3b8" }}
 />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
 <Tooltip
 cursor={{ fill: "#fff1f2" }}
 contentStyle={{ borderRadius: 8, border: "1px solid #fecdd3", fontSize: 12 }}
 formatter={(v: number) => [v, "Propostas"]}
 />
 <Bar dataKey="total" fill="#e11d48" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 <Card className="col-span-3 border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">
 Por Coordenador
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-56">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={coordinatorData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
 <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} width={48} />
 <Tooltip
 cursor={{ fill: "#fff1f2" }}
 contentStyle={{ borderRadius: 8, border: "1px solid #fecdd3", fontSize: 12 }}
 formatter={(v: number) => [v, "Propostas"]}
 />
 <Bar dataKey="total" fill="#fb7185" radius={[0, 4, 4, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Recent Proposals Table */}
 <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
 <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-700">
 <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">
 Propostas Recentes
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Curso</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Coordenador</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Área</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fase</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
 <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Atualizado</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {recent.map((p: YMedProposal) => (
 <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
 <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100 max-w-[220px] truncate">{p.courseName}</td>
 <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.coordinator}</td>
 <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.area}</td>
 <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
 <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
 {p.currentPhase}
 </span>
 </td>
 <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
 <td className="px-4 py-3 text-slate-400 text-xs">
 {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
