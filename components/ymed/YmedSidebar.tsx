"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
 LayoutDashboard, Columns2, FileText, Search, Users,
 History, Bot, X, ChevronLeft, ChevronRight,
 GraduationCap, BarChart3, BookMarked, LogOut, Stethoscope,
} from "lucide-react";
import { useAppContext } from "@/lib/store";

const MAIN_NAV = [
 { name: "Dashboard", href: "/ymed", icon: LayoutDashboard, exact: true },
 { name: "Pipeline", href: "/ymed/pipeline", icon: Columns2 },
 { name: "Propostas", href: "/ymed/propostas", icon: FileText },
 { name: "Coordenadores", href: "/ymed/coordenadores", icon: GraduationCap },
 { name: "Busca Avançada", href: "/ymed/busca", icon: Search },
 { name: "Modo Comitê", href: "/ymed/comite", icon: Users },
 { name: "Histórico", href: "/ymed/historico", icon: History },
 { name: "Assistente IA", href: "/ymed/ia", icon: Bot },
];

const YMED_NAV = [
 { name: "Cursos YMed", href: "/ymed/cursos", icon: BookMarked },
 { name: "Métricas", href: "/ymed/metricas", icon: BarChart3 },
];

export function YmedSidebar({
 isOpen, setIsOpen, isCollapsed, setIsCollapsed,
}: {
 isOpen?: boolean;
 setIsOpen?: (val: boolean) => void;
 isCollapsed?: boolean;
 setIsCollapsed?: (val: boolean) => void;
}) {
 const pathname = usePathname();
 const router = useRouter();
 const { logout } = useAppContext();

 const isActive = (href: string, exact?: boolean) => {
 if (exact) return pathname === href;
 return pathname === href || pathname.startsWith(href + "/");
 };

 const linkClass = (active: boolean) =>
 `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
 isCollapsed ? "justify-center px-0" : "px-3"
 } ${active ? "text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white"}`;

 return (
 <>
 {isOpen && (
 <div className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" onClick={() => setIsOpen?.(false)} />
 )}
 <aside
 className={`border-r bg-white dark:bg-slate-800 h-screen fixed top-0 flex flex-col z-30 transition-all duration-300 ease-in-out ${
 isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0 md:translate-x-0"
 } ${isCollapsed ? "w-20" : "w-64"}`}
 >
 {/* Header */}
 <div className={`h-16 flex items-center shrink-0 border-b ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}>
 {!isCollapsed && (
 <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-300">
 <div
 className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
 style={{ background: "linear-gradient(135deg, var(--ymed-primary), var(--ymed-secondary))" }}
 >
 <Stethoscope className="w-4 h-4 text-white" />
 </div>
 <div>
 <h1 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">Central YMed</h1>
 <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--ymed-primary)" }}>
 Unyleya Med
 </p>
 </div>
 </div>
 )}
 {isCollapsed && (
 <div
 className="w-9 h-9 rounded-xl flex items-center justify-center"
 style={{ background: "linear-gradient(135deg, var(--ymed-primary), var(--ymed-secondary))" }}
 >
 <Stethoscope className="w-5 h-5 text-white" />
 </div>
 )}
 <button
 className="hidden md:flex p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-md transition-colors ml-auto"
 onClick={() => setIsCollapsed?.(!isCollapsed)}
 >
 {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
 </button>
 {isOpen && (
 <button className="md:hidden p-1 -mr-2 text-slate-500 dark:text-slate-400" onClick={() => setIsOpen?.(false)}>
 <X className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 overflow-x-hidden">
 {MAIN_NAV.map((item) => {
 const active = isActive(item.href, item.exact);
 return (
 <Link
 key={item.href}
 href={item.href}
 className={linkClass(active)}
 style={active ? { backgroundColor: "var(--ymed-primary)" } : {}}
 title={isCollapsed ? item.name : undefined}
 >
 <item.icon
 className="h-5 w-5 shrink-0"
 style={active ? { color: "white" } : { color: "#94a3b8" }}
 />
 {!isCollapsed && <span className="truncate">{item.name}</span>}
 </Link>
 );
 })}

 {/* YMed section separator */}
 <div className={`pt-4 pb-2 ${isCollapsed ? "px-0" : "px-1"}`}>
 {!isCollapsed ? (
 <div className="flex items-center gap-2">
 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">YMed</span>
 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
 </div>
 ) : (
 <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />
 )}
 </div>

 {YMED_NAV.map((item) => {
 const active = isActive(item.href);
 return (
 <Link
 key={item.href}
 href={item.href}
 className={linkClass(active)}
 style={active ? { backgroundColor: "var(--ymed-secondary)" } : {}}
 title={isCollapsed ? item.name : undefined}
 >
 <item.icon
 className="h-5 w-5 shrink-0"
 style={active ? { color: "white" } : { color: "#94a3b8" }}
 />
 {!isCollapsed && <span className="truncate">{item.name}</span>}
 </Link>
 );
 })}
 </nav>

 {/* Footer */}
 {!isCollapsed && (
 <div className="p-3 border-t space-y-1 shrink-0">
 <Link
 href="/portal"
 className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors"
 >
 <LayoutDashboard className="w-4 h-4" />
 Trocar portal
 </Link>
 <button
 onClick={() => { logout(); router.push("/login"); }}
 className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Sair
 </button>
 </div>
 )}
 </aside>
 </>
 );
}
