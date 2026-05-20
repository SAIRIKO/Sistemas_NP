"use client";

import { RoleSwitcher } from "./RoleSwitcher";
import { Bell, Search as SearchIcon, LogOut, User as UserIcon, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "./ui/input";
import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Header({ onMenuToggle, isSidebarCollapsed }: { onMenuToggle?: () => void; isSidebarCollapsed?: boolean }) {
 const { currentUser, logout, globalSearchQuery, setGlobalSearchQuery } = useAppContext();
 const { theme, setTheme } = useTheme();
 const router = useRouter();

 const handleLogout = () => {
 logout();
 router.push("/login");
 };

 return (
 <header
 className={`h-16 border-b bg-white dark:bg-slate-900 dark:border-slate-700 fixed top-0 right-0 left-0 ${
 isSidebarCollapsed ? "md:left-20" : "md:left-64"
 } flex items-center justify-between px-4 md:px-8 z-10 transition-all duration-300 shadow-sm`}
 >
 <div className="flex-1 md:w-96 flex items-center gap-2 md:gap-0">
 <button
 className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md"
 onClick={onMenuToggle}
 >
 <Menu className="h-6 w-6" />
 </button>
 <div className="relative w-full max-w-sm">
 <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 type="search"
 placeholder="Busca rápida..."
 className="w-full bg-slate-50 dark:bg-slate-800/50 pl-9 rounded-full h-9 focus-visible:ring-1 border-slate-200 dark:border-slate-700"
 value={globalSearchQuery}
 onChange={(e) => setGlobalSearchQuery(e.target.value)}
 style={{ "--tw-ring-color": "var(--brand-primary)" } as React.CSSProperties}
 />
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button
 className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
 onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
 title="Alternar tema"
 >
 <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
 <Moon className="absolute top-1.5 left-1.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
 </button>

 <button className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors hidden md:block">
 <Bell className="h-5 w-5" />
 <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900"></span>
 </button>
 <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block mx-2"></div>
 <div className="hidden md:flex items-center gap-2">
 <span className="text-xs text-slate-500 dark:text-slate-400">Perfil:</span>
 <RoleSwitcher />
 </div>

 {currentUser && (
 <div className="flex items-center gap-2.5">
 <div className="flex items-center gap-2 text-sm">
 <div
 className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0"
 style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-tertiary))" }}
 >
 {currentUser.name.charAt(0).toUpperCase()}
 </div>
 <span className="text-slate-600 dark:text-slate-200 font-medium hidden xl:block max-w-[120px] truncate">
 {currentUser.name.split(" ")[0]}
 </span>
 </div>
 <button
 onClick={handleLogout}
 title="Sair"
 className="text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
 >
 <LogOut className="h-4 w-4" />
 </button>
 </div>
 )}

 {!currentUser && (
 <button
 onClick={() => router.push("/login")}
 className="text-sm flex items-center gap-1 font-medium transition"
 style={{ color: "var(--brand-primary)" }}
 >
 <UserIcon className="h-4 w-4" /> Entrar
 </button>
 )}
 </div>
 </header>
 );
}
