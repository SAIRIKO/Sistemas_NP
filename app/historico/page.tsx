"use client";

import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History as HistoryIcon, ArrowRightLeft, PlusCircle } from "lucide-react";

export default function HistoricoPage() {
 const { proposals } = useAppContext();

 // Generate events from proposals
 const events = proposals.flatMap(p => {
 const items = [
 {
 id: `${p.id}-created`,
 title: `Proposta Criada: ${p.courseName}`,
 date: new Date(p.createdAt),
 description: `Nova solicitação inserida no Pipefy.`,
 icon: <PlusCircle className="w-4 h-4" />,
 color: "bg-emerald-100 text-emerald-600",
 user: "Integrador Pipefy"
 }
 ];

 if (p.updatedAt && p.updatedAt !== p.createdAt) {
 items.push({
 id: `${p.id}-updated`,
 title: `Status Atualizado: ${p.courseName}`,
 date: new Date(p.updatedAt),
 description: `Movido para a fase: ${p.currentPhase}`,
 icon: <ArrowRightLeft className="w-4 h-4" />,
 color: "bg-blue-100 text-blue-600",
 user: "Sistema"
 });
 }

 return items;
 }).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50);

 return (
 <div className="space-y-6 max-w-4xl mx-auto pb-12">
 <div className="mb-6">
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <HistoryIcon className="h-6 w-6 text-blue-600" /> Audit Trail & Histórico Global
 </h2>
 <p className="text-slate-500 dark:text-slate-400 mt-1">Visão cronológica de eventos de todo o sistema ({events.length} eventos).</p>
 </div>

 <Card className="shadow-sm">
 <CardContent className="p-6">
 <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
 
 {events.map((event, idx) => (
 <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
 <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${event.color}`}>
 {event.icon}
 </div>
 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded border border-slate-100 dark:border-slate-700 shadow-sm ml-4 md:ml-0 md:group-odd:mr-4 md:group-even:ml-4">
 <div className="flex justify-between items-center mb-1">
 <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate pr-2">{event.title}</span>
 <time className="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
 {format(event.date, "dd/MM 'às' HH:mm", { locale: ptBR })}
 </time>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
 <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 italic">
 Por: {event.user}
 </div>
 </div>
 </div>
 ))}

 {events.length === 0 && (
 <div className="text-center py-12 text-slate-400">
 Nenhum evento registrado ainda.
 </div>
 )}

 </div>
 </CardContent>
 </Card>
 </div>
 );
}
