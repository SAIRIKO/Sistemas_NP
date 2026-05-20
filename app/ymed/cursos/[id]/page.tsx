"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ymedCourses } from "@/lib/ymed-mock";
import { YMedSituation, YMedMetricEntry } from "@/lib/ymed-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CsvExportModal, CsvColumn } from "@/components/ymed/CsvExportModal";
import {
 ChevronLeft, Download, Copy, Calendar, BookOpen,
 Stethoscope, TrendingUp, Clock, Check,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const SITUATION_COLORS: Record<YMedSituation, string> = {
 "Em Oferta": "bg-emerald-100 text-emerald-800 border-emerald-200",
 "Em Cadastro": "bg-blue-100 text-blue-800 border-blue-200",
 "Em Construção": "bg-amber-100 text-amber-800 border-amber-200",
 "Suspenso": "bg-orange-100 text-orange-800 border-orange-200",
 "Descontinuado": "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
 "Cancelado": "bg-red-100 text-red-700 border-red-200",
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const UFS = ["Todos", "SP", "RJ", "MG", "BA", "RS", "PR", "SC", "GO", "PE", "CE", "AM", "PA", "MT", "MS", "ES"];

const CSV_COLUMNS: CsvColumn[] = [
 { key: "year", label: "Ano" },
 { key: "month", label: "Mês" },
 { key: "uf", label: "UF" },
 { key: "enrollments", label: "Matrículas" },
 { key: "preEnrollments", label: "Pré-matrículas" },
 { key: "sales", label: "Vendas (R$)" },
];

export default function YmedCourseDetailPage() {
 const { id } = useParams();
 const router = useRouter();
 const course = ymedCourses.find(c => c.id === id);

 const [yearFilter, setYearFilter] = useState("all");
 const [monthFilter, setMonthFilter] = useState("all");
 const [ufFilter, setUfFilter] = useState("Todos");
 const [csvOpen, setCsvOpen] = useState(false);
 const [copied, setCopied] = useState(false);

 const filteredMetrics = useMemo(() => {
 if (!course) return [];
 return course.metrics.filter(m => {
 const matchYear = yearFilter === "all" || m.year === Number(yearFilter);
 const matchMonth = monthFilter === "all" || m.month === Number(monthFilter);
 const matchUf = ufFilter === "Todos" || m.uf === ufFilter;
 return matchYear && matchMonth && matchUf;
 });
 }, [course, yearFilter, monthFilter, ufFilter]);

 const totals = useMemo(() => ({
 enrollments: filteredMetrics.reduce((s, m) => s + m.enrollments, 0),
 preEnrollments: filteredMetrics.reduce((s, m) => s + m.preEnrollments, 0),
 sales: filteredMetrics.reduce((s, m) => s + m.sales, 0),
 }), [filteredMetrics]);

 const csvRows = filteredMetrics.map(m => ({
 year: m.year,
 month: MONTHS[m.month - 1],
 uf: m.uf,
 enrollments: m.enrollments,
 preEnrollments: m.preEnrollments,
 sales: `R$ ${m.sales.toLocaleString("pt-BR")}`,
 }));

 const handleCopy = () => {
 const header = CSV_COLUMNS.map(c => c.label).join("\t");
 const rows = csvRows.map(r => Object.values(r).join("\t")).join("\n");
 navigator.clipboard.writeText(`${header}\n${rows}`).then(() => {
 setCopied(true);
 toast.success("Tabela copiada!");
 setTimeout(() => setCopied(false), 2000);
 });
 };

 if (!course) {
 return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Curso não encontrado.</div>;
 }

 return (
 <div className="max-w-5xl mx-auto space-y-6 pb-16">
 {/* Back */}
 <button
 onClick={() => router.back()}
 className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors"
 >
 <ChevronLeft className="w-4 h-4" /> Voltar para Cursos YMed
 </button>

 {/* Course header */}
 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
 <Badge variant="outline" className={`${SITUATION_COLORS[course.situation]} font-semibold`}>
 {course.situation}
 </Badge>
 <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
 {course.coordinator}
 </span>
 </div>
 <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{course.name}</h1>
 <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider font-semibold">{course.area}</p>
 </div>
 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
 <Calendar className="w-4 h-4 text-slate-400" />
 Lançado em {format(new Date(course.launchDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
 </div>
 </div>

 {/* Description */}
 <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">{course.description}</p>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
 <div className="flex items-center gap-3 bg-rose-50 rounded-xl p-4">
 <Stethoscope className="w-5 h-5 text-rose-500" />
 <div>
 <p className="text-xs text-rose-600 font-semibold">Coordenador</p>
 <p className="font-bold text-rose-800">{course.coordinator}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
 <BookOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
 <div>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Disciplinas</p>
 <p className="font-bold text-slate-800 dark:text-slate-100">{course.disciplines.length}</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
 <TrendingUp className="w-5 h-5 text-emerald-500" />
 <div>
 <p className="text-xs text-emerald-600 font-semibold">Matrículas Totais</p>
 <p className="font-bold text-emerald-800">
 {course.metrics.reduce((s, m) => s + m.enrollments, 0).toLocaleString("pt-BR")}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Disciplines */}
 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-rose-500" /> Disciplinas
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {course.disciplines.map(d => (
 <div key={d.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-100 dark:border-slate-700">
 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
 <span className="text-xs text-slate-400 font-semibold">{d.workload}h</span>
 </div>
 ))}
 </div>
 </div>

 {/* History */}
 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
 <Clock className="w-5 h-5 text-rose-500" /> Histórico
 </h2>
 <div className="relative pl-6 space-y-4">
 <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
 {course.history.map((h, i) => (
 <div key={i} className="relative">
 <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow" />
 <p className="text-xs text-slate-400 font-semibold mb-0.5">
 {format(new Date(h.date), "dd/MM/yyyy")}
 </p>
 <p className="text-sm text-slate-700 dark:text-slate-200">{h.event}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Metrics */}
 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-rose-500" /> Métricas
 </h2>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
 {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
 Copiar
 </Button>
 <Button size="sm" onClick={() => setCsvOpen(true)} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
 <Download className="h-4 w-4" /> Gerar CSV
 </Button>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-3 mb-6">
 <div className="flex flex-col gap-1">
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ano</label>
 <Select value={yearFilter} onValueChange={setYearFilter}>
 <SelectTrigger className="h-8 w-[110px] text-sm"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Todos</SelectItem>
 {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mês</label>
 <Select value={monthFilter} onValueChange={setMonthFilter}>
 <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Todos</SelectItem>
 {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">UF</label>
 <Select value={ufFilter} onValueChange={setUfFilter}>
 <SelectTrigger className="h-8 w-[120px] text-sm"><SelectValue /></SelectTrigger>
 <SelectContent>
 {UFS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* KPI totals */}
 <div className="grid grid-cols-3 gap-4 mb-6">
 <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
 <p className="text-2xl font-bold text-emerald-700">{totals.enrollments.toLocaleString("pt-BR")}</p>
 <p className="text-xs font-semibold text-emerald-600 mt-1">Matrículas</p>
 </div>
 <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
 <p className="text-2xl font-bold text-blue-700">{totals.preEnrollments.toLocaleString("pt-BR")}</p>
 <p className="text-xs font-semibold text-blue-600 mt-1">Pré-matrículas</p>
 </div>
 <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
 <p className="text-2xl font-bold text-rose-700">R$ {totals.sales.toLocaleString("pt-BR")}</p>
 <p className="text-xs font-semibold text-rose-600 mt-1">Vendas</p>
 </div>
 </div>

 {/* Table */}
 <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-slate-50 dark:bg-slate-800/50">
 <tr>
 <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ano</th>
 <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mês</th>
 <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">UF</th>
 <th className="text-right px-4 py-3 text-xs font-bold text-emerald-600 uppercase">Matrículas</th>
 <th className="text-right px-4 py-3 text-xs font-bold text-blue-600 uppercase">Pré-matrículas</th>
 <th className="text-right px-4 py-3 text-xs font-bold text-rose-600 uppercase">Vendas</th>
 </tr>
 </thead>
 <tbody>
 {filteredMetrics.slice(0, 50).map((m, i) => (
 <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-800/50/50"}>
 <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-medium">{m.year}</td>
 <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{MONTHS[m.month - 1]}</td>
 <td className="px-4 py-2.5"><span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{m.uf}</span></td>
 <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{m.enrollments.toLocaleString("pt-BR")}</td>
 <td className="px-4 py-2.5 text-right font-semibold text-blue-700">{m.preEnrollments.toLocaleString("pt-BR")}</td>
 <td className="px-4 py-2.5 text-right font-semibold text-rose-700">R$ {m.sales.toLocaleString("pt-BR")}</td>
 </tr>
 ))}
 </tbody>
 </table>
 {filteredMetrics.length > 50 && (
 <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t text-xs text-slate-400 text-center">
 Mostrando 50 de {filteredMetrics.length} registros. Use os filtros para refinar a visualização ou exporte o CSV completo.
 </div>
 )}
 </div>
 </div>

 <CsvExportModal
 open={csvOpen}
 onClose={() => setCsvOpen(false)}
 columns={CSV_COLUMNS}
 rows={csvRows}
 filename={`metricas-${course.id}`}
 />
 </div>
 );
}
