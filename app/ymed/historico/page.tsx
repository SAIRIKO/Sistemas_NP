"use client";

import { useMemo } from "react";
import { ymedProposals } from "@/lib/ymed-mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Calendar, BookOpen, ArrowRight } from "lucide-react";

interface TimelineEvent {
 date: string;
 event: string;
 courseName: string;
 coordinator: string;
 status: string;
}

function statusDot(status: string) {
 const map: Record<string, string> = {
 Aprovado: "bg-emerald-500",
 "Em análise": "bg-amber-400",
 "Recebendo Proposta": "bg-sky-400",
 Reprovado: "bg-rose-500",
 Standby: "bg-slate-400",
 };
 return map[status] ?? "bg-slate-300";
}

function formatDate(dateStr: string) {
 const d = new Date(dateStr);
 return d.toLocaleDateString("pt-BR", {
 day: "2-digit",
 month: "long",
 year: "numeric",
 });
}

function groupByMonth(events: TimelineEvent[]) {
 const grouped: Record<string, TimelineEvent[]> = {};
 events.forEach((e) => {
 const d = new Date(e.date);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
 if (!grouped[key]) grouped[key] = [];
 grouped[key].push(e);
 });
 return grouped;
}

function monthLabel(key: string) {
 const [year, month] = key.split("-");
 const d = new Date(Number(year), Number(month) - 1, 1);
 return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function YmedHistoricoPage() {
 const events = useMemo<TimelineEvent[]>(() => {
 const all: TimelineEvent[] = [];
 ymedProposals.forEach((p) => {
 // createdAt as proposal submitted
 all.push({
 date: p.createdAt,
 event: `Proposta submetida — fase: "${p.currentPhase}"`,
 courseName: p.courseName,
 coordinator: p.coordinator,
 status: p.status,
 });
 // updatedAt as phase change (if different)
 if (p.updatedAt !== p.createdAt) {
 all.push({
 date: p.updatedAt,
 event: `Atualização de status — fase atual: "${p.currentPhase}" | status: "${p.status}"`,
 courseName: p.courseName,
 coordinator: p.coordinator,
 status: p.status,
 });
 }
 });
 return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 }, []);

 const grouped = useMemo(() => groupByMonth(events), [events]);
 const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

 return (
 <div className="space-y-6 max-w-4xl">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <History className="w-6 h-6 text-rose-600" />
 Histórico de Propostas
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Linha do tempo de eventos de todas as propostas YMed
 </p>
 </div>

 {/* Stats bar */}
 <div className="flex flex-wrap gap-3">
 <div className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
 {events.length} eventos registrados
 </div>
 <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
 {ymedProposals.length} propostas
 </div>
 </div>

 {/* Timeline */}
 <div className="space-y-8">
 {sortedMonths.map((month) => (
 <div key={month}>
 {/* Month header */}
 <div className="flex items-center gap-3 mb-4">
 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold capitalize">
 <Calendar className="w-3 h-3" />
 {monthLabel(month)}
 </div>
 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
 <span className="text-xs text-slate-400 shrink-0">
 {grouped[month].length} evento{grouped[month].length !== 1 ? "s" : ""}
 </span>
 </div>

 {/* Events */}
 <div className="relative pl-6 space-y-4">
 {/* Vertical line */}
 <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-800" />

 {grouped[month].map((ev, idx) => (
 <div key={idx} className="relative flex gap-4">
 {/* Dot */}
 <div className={`absolute -left-4 top-2 w-3 h-3 rounded-full border-2 border-white shadow ${statusDot(ev.status)}`} />

 {/* Card */}
 <Card className="flex-1 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-rose-200 transition-all">
 <CardContent className="py-3 px-4">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
 {ev.coordinator}
 </span>
 <ArrowRight className="w-3 h-3 text-slate-300" />
 <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px] sm:max-w-none">
 {ev.courseName}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
 <BookOpen className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
 {ev.event}
 </p>
 </div>
 <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
 {formatDate(ev.date)}
 </span>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {events.length === 0 && (
 <div className="text-center py-24 text-slate-400">
 <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
 <p className="text-lg font-semibold">Nenhum evento registrado</p>
 </div>
 )}
 </div>
 );
}
