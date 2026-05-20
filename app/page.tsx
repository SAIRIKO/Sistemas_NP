"use client";

import { useAppContext } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { FileText, CheckCircle, AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
 const { proposals } = useAppContext();

 const total = proposals.length;
 const cursosRealmenteAprovadosFase = proposals.filter(p => p.currentPhase === 'Propostas Aprovadas' || p.currentPhase === 'Aprovadas').length;
 const cursosReprovados = proposals.filter(p => p.status === 'Reprovado').length;
 const inCommittee = proposals.filter(p => p.currentPhase === 'Comitê' || p.currentPhase === 'Aguardando Comitê').length;
 const highRisk = proposals.filter(p => p.cannibalizationRisk === 'alto').length;
 const withoutSimilarity = proposals.filter(p => !p.maxSimilarity).length;

 const dataPhase = [
 { name: 'Solicitações', value: proposals.filter(p => p.currentPhase === 'Solicitações').length },
 { name: 'Reservas', value: proposals.filter(p => p.currentPhase.includes('Reservas')).length },
 { name: 'Comitê', value: inCommittee },
 { name: 'Aprovadas', value: cursosRealmenteAprovadosFase },
 ];

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Dashboard</h2>
 </div>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <StatCard title="Total de Propostas" value={total} icon={FileText} description="+2 desde o último mês" />
 <StatCard title="Cursos Aprovados" value={cursosRealmenteAprovadosFase} icon={CheckCircle} description="Fluxo concluído" />
 <StatCard title="Aguardando Comitê" value={inCommittee} icon={Clock} description="Prontas para pauta" />
 <StatCard title="Cursos Reprovados" value={cursosReprovados} icon={AlertTriangle} description="Reprovados no fluxo" />
 </div>

 <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
 <Card className="col-span-4">
 <CardHeader>
 <CardTitle>Propostas por Fase</CardTitle>
 </CardHeader>
 <CardContent className="pl-2">
 <div className="h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={dataPhase}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="name" axisLine={false} tickLine={false} />
 <YAxis axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill: '#f1f5f9' }} />
 <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 <Card className="col-span-3">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-amber-500" />
 Alertas de Atenção
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
 <span className="text-sm text-red-800 font-medium">Alto risco de canibalização</span>
 <span className="bg-red-200 text-red-900 text-xs font-bold px-2 py-1 rounded-full">{highRisk}</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
 <span className="text-sm text-amber-800 font-medium">Sem análise de similaridade</span>
 <span className="bg-amber-200 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">{withoutSimilarity}</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
 <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">Propostas sem parecer</span>
 <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-full">{proposals.filter(p => !p.preCommitteeOpinion).length}</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
 <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">Aguardando votação no comitê</span>
 <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-full">{inCommittee}</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
