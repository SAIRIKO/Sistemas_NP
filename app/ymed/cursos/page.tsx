"use client";

import { useState, useMemo } from "react";
import { ymedCourses } from "@/lib/ymed-mock";
import { YMedCourse, YMedSituation, YMedCoordinator } from "@/lib/ymed-types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookMarked, ChevronRight } from "lucide-react";
import Link from "next/link";

const SITUATION_COLORS: Record<YMedSituation, string> = {
 "Em Oferta": "bg-emerald-100 text-emerald-800 border-emerald-200",
 "Em Cadastro": "bg-blue-100 text-blue-800 border-blue-200",
 "Em Construção": "bg-amber-100 text-amber-800 border-amber-200",
 "Suspenso": "bg-orange-100 text-orange-800 border-orange-200",
 "Descontinuado": "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
 "Cancelado": "bg-red-100 text-red-700 border-red-200",
};

const COORDINATORS: YMedCoordinator[] = ["INSBE", "Alano", "ILHHH", "IJR"];
const SITUATIONS: YMedSituation[] = ["Em Oferta", "Em Cadastro", "Em Construção", "Suspenso", "Descontinuado", "Cancelado"];

export default function YmedCursosPage() {
 const [search, setSearch] = useState("");
 const [coordFilter, setCoordFilter] = useState("all");
 const [situationFilter, setSituationFilter] = useState("all");

 const filtered = useMemo(() => {
 return ymedCourses.filter(c => {
 const q = search.toLowerCase();
 const matchSearch = !q || c.name.toLowerCase().includes(q) || c.coordinator.toLowerCase().includes(q) || c.area.toLowerCase().includes(q);
 const matchCoord = coordFilter === "all" || c.coordinator === coordFilter;
 const matchSituation = situationFilter === "all" || c.situation === situationFilter;
 return matchSearch && matchCoord && matchSituation;
 });
 }, [search, coordFilter, situationFilter]);

 const byStatus = (s: YMedSituation) => ymedCourses.filter(c => c.situation === s).length;

 return (
 <div className="space-y-6 pb-12">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Cursos YMed</h2>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Portfólio de cursos de medicina da Unyleya Med.</p>
 </div>
 <div className="flex gap-3 flex-wrap">
 {([["Em Oferta", "emerald"], ["Em Cadastro", "blue"], ["Em Construção", "amber"]] as const).map(([s, c]) => (
 <div key={s} className={`bg-${c}-50 border border-${c}-200 px-3 py-1.5 rounded-lg text-sm`}>
 <span className={`font-bold text-${c}-700`}>{byStatus(s as YMedSituation)}</span>
 <span className={`text-${c}-600 ml-1.5`}>{s}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-3 items-end bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
 <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Busca</label>
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 placeholder="Nome, coordenador ou área..."
 className="pl-9 h-9 bg-white dark:bg-slate-800"
 value={search}
 onChange={e => setSearch(e.target.value)}
 />
 </div>
 </div>
 <div className="flex flex-col gap-1.5 w-[150px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Coordenador</label>
 <Select value={coordFilter} onValueChange={setCoordFilter}>
 <SelectTrigger className="h-9 bg-white dark:bg-slate-800"><SelectValue placeholder="Todos" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Todos</SelectItem>
 {COORDINATORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="flex flex-col gap-1.5 w-[180px]">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Situação</label>
 <Select value={situationFilter} onValueChange={setSituationFilter}>
 <SelectTrigger className="h-9 bg-white dark:bg-slate-800"><SelectValue placeholder="Todas" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Todas</SelectItem>
 {SITUATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* Grid */}
 {filtered.length === 0 ? (
 <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
 <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
 <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum curso encontrado</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {filtered.map(course => (
 <Link key={course.id} href={`/ymed/cursos/${course.id}`} className="group">
 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-rose-200 p-5 h-full flex flex-col">
 {/* Top */}
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 ${SITUATION_COLORS[course.situation]}`}>
 {course.situation}
 </Badge>
 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
 </div>

 {/* Course name */}
 <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1 group-hover:text-rose-700 transition-colors line-clamp-2">
 {course.name}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{course.area}</p>

 {/* Description */}
 <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 flex-1 mb-4">
 {course.description}
 </p>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-auto">
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
 {course.coordinator}
 </span>
 <span className="text-xs text-slate-400">
 {course.disciplines.length} disciplinas
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}
 </div>
 );
}
