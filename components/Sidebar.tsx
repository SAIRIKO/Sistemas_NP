"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Columns2, FileText, Search, Users, BarChart3, History, Bot, Settings, X, GraduationCap, ChevronLeft, ChevronRight, LogOut, User, MessageSquare } from "lucide-react";
import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
 { name: "Dashboard", href: "/", icon: LayoutDashboard },
 { name: "Pipeline", href: "/pipeline", icon: Columns2 },
 { name: "Propostas", href: "/propostas", icon: FileText },
 { name: "Coordenadores", href: "/coordenadores", icon: GraduationCap },
 { name: "Busca Avançada", href: "/busca", icon: Search },
 { name: "Modo Comitê", href: "/comite", icon: Users },
 { name: "Histórico", href: "/historico", icon: History },
 { name: "Assistente IA", href: "/ia", icon: Bot },
 { name: "Feedbacks", href: "/feedbacks", icon: MessageSquare },
 { name: "Configurações", href: "/configuracoes", icon: Settings, adminOnly: true },
];

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: { isOpen?: boolean; setIsOpen?: (val: boolean) => void; isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
 const pathname = usePathname();
 const { role, logout, openLaunchModal, currentUser, getEffectivePermissions } = useAppContext();
 const router = useRouter();

 const permissions = currentUser ? getEffectivePermissions(currentUser.id) : null;

 const isActive = (href: string) =>
 href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

 return (
 <>
 {isOpen && (
 <div
 className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
 onClick={() => setIsOpen?.(false)}
 />
 )}
 <aside
 className={`border-r bg-white dark:bg-slate-900 dark:border-slate-700 h-screen fixed top-0 flex flex-col z-30 transition-all duration-300 ease-in-out ${
 isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0 md:translate-x-0"
 } ${isCollapsed ? "w-20" : "w-64"}`}
 >
 {/* Header */}
 <div className={`h-16 flex items-center shrink-0 border-b dark:border-slate-700 ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}>
 {!isCollapsed && (
 <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-300">
 <div
 className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
 style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-tertiary))" }}
 >
 <span className="text-white text-xs font-black">CP</span>
 </div>
 <div>
 <h1 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">Central de Propostas</h1>
 <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--brand-primary)" }}>
 Unyleya Educacional
 </p>
 </div>
 </div>
 )}
 {isCollapsed && (
 <div
 className="w-9 h-9 rounded-xl flex items-center justify-center"
 style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-tertiary))" }}
 >
 <span className="text-white text-xs font-black">CP</span>
 </div>
 )}
 <button
 className="hidden md:flex p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors ml-auto"
 onClick={() => setIsCollapsed?.(!isCollapsed)}
 title={isCollapsed ? "Expandir menu" : "Recolher menu"}
 >
 {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
 </button>
 {isOpen && (
 <button className="md:hidden p-1 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100" onClick={() => setIsOpen?.(false)}>
 <X className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 overflow-x-hidden">
 {NAV_ITEMS.filter(i => {
    if (!permissions) return false;
    const pageKey = i.href === "/" ? "dashboard" : i.href.replace("/", "");
    return !!permissions.pages[pageKey];
  }).map((item) => {
 const active = isActive(item.href);

 // Intercept IA click
 if (item.href === "/ia") {
 return (
 <button
 key={item.href}
 onClick={openLaunchModal}
 className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
 isCollapsed ? "justify-center px-0" : "px-3"
 } ${active ? "text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:text-white"}`}
 style={active ? { backgroundColor: "var(--brand-primary)" } : {}}
 title={isCollapsed ? item.name : undefined}
 >
 <item.icon
 className="h-5 w-5 shrink-0"
 style={active ? { color: "white" } : { color: "#94a3b8" }}
 />
 {!isCollapsed && <span className="truncate">{item.name}</span>}
 </button>
 );
 }

 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
 isCollapsed ? "justify-center px-0" : "px-3"
 } ${active ? "text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:text-white"}`}
 style={active ? { backgroundColor: "var(--brand-primary)" } : {}}
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

 {/* Footer info */}
 <div className={`p-4 border-t dark:border-slate-700 shrink-0 ${isCollapsed ? "px-2" : ""}`}>
 <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
 <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
 <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
 </div>
 {!isCollapsed && (
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
    {currentUser?.name?.split(' ')[0] || 'Usuário'}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium uppercase tracking-wider">
    {currentUser?.role || role}
 </p>
 </div>
 )}
 </div>
 
 <div className="mt-4 space-y-1">
 <Link
 href="/portal"
 className={`w-full flex items-center gap-2 py-2 px-3 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors ${
 isCollapsed ? "justify-center px-0" : ""
 }`}
 >
 <Columns2 className="h-4 w-4" />
 {!isCollapsed && <span>Trocar portal</span>}
 </Link>
 
 <button 
 onClick={() => { logout(); router.push("/login"); }}
 className={`w-full flex items-center gap-2 py-2 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors ${
 isCollapsed ? "justify-center px-0" : ""
 }`}
 >
 <LogOut className="h-4 w-4" />
 {!isCollapsed && <span>Sair</span>}
 </button>
 </div>
 </div>
 </aside>
 </>
 );
}
