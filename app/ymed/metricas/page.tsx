"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function MetricasYMedPage() {
 return (
 <div className="space-y-6 max-w-6xl mx-auto pb-12">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Métricas YMed</h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 Acompanhe o desempenho e resultados dos cursos YMed
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { title: "Total de Matrículas", value: "1.245", label: "+12% este mês" },
 { title: "Pré-Matrículas Ativas", value: "342", label: "+5% este mês" },
 { title: "Taxa de Conversão", value: "28.5%", label: "+2.1% este mês" },
 { title: "Cursos em Oferta", value: "18", label: "2 lançados este mês" },
 ].map((kpi, i) => (
 <Card key={i}>
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div className="space-y-2">
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
 <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{kpi.value}</p>
 </div>
 <div className="p-2 bg-[#1c9a96]/10 rounded-lg">
 <BarChart3 className="w-5 h-5 text-[#1c9a96]" />
 </div>
 </div>
 <p className="text-xs text-[#1c9a96] font-medium mt-4">{kpi.label}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 <Card className="mt-6">
 <CardHeader>
 <CardTitle className="text-lg">Desempenho (Em breve)</CardTitle>
 </CardHeader>
 <CardContent className="h-64 flex items-center justify-center border-t border-slate-100 dark:border-slate-700">
 <p className="text-slate-400">Gráficos de vendas e matrículas estarão disponíveis em breve.</p>
 </CardContent>
 </Card>
 </div>
 );
}
