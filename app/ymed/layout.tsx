"use client";

import { useState } from "react";
import { YmedSidebar } from "@/components/ymed/YmedSidebar";
import { Bell, Search, Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/lib/store";
import { Input } from "@/components/ui/input";

export default function YmedLayout({ children }: { children: React.ReactNode }) {
 const [isOpen, setIsOpen] = useState(false);
 const [isCollapsed, setIsCollapsed] = useState(false);
 const { theme, setTheme } = useTheme();
 const { currentUser, globalSearchQuery, setGlobalSearchQuery } = useAppContext();

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50">
 <YmedSidebar
 isOpen={isOpen}
 setIsOpen={setIsOpen}
 isCollapsed={isCollapsed}
 setIsCollapsed={setIsCollapsed}
 />

 {/* Header */}
 <header
 className={`h-16 border-b bg-white dark:bg-slate-800 fixed top-0 right-0 left-0 ${
 isCollapsed ? "md:left-20" : "md:left-64"
 } flex items-center justify-between px-4 md:px-8 z-10 transition-all duration-300`}
 >
 <div className="flex-1 md:w-96 flex items-center gap-2 md:gap-0">
 <button
 className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-md"
 onClick={() => setIsOpen(true)}
 >
 <Menu className="h-6 w-6" />
 </button>
 <div className="relative w-full max-w-sm">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
 <Input
 type="search"
 placeholder="Busca rápida..."
 className="w-full bg-slate-50 dark:bg-slate-800/50 pl-9 rounded-full h-9 focus-visible:ring-1"
 value={globalSearchQuery}
 onChange={(e) => setGlobalSearchQuery(e.target.value)}
 />
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button
 className="text-slate-400 hover:text-slate-600 dark:text-slate-300 relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors"
 onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
 title="Alternar tema"
 >
 <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
 <Moon className="absolute top-1.5 left-1.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
 </button>

 <button className="text-slate-400 hover:text-slate-600 dark:text-slate-300 relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
 <Bell className="h-5 w-5" />
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
 </button>

 <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

 {currentUser && (
 <div className="flex items-center gap-2 text-sm">
 <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-xs shrink-0">
 {currentUser.name.charAt(0).toUpperCase()}
 </div>
 <span className="text-slate-600 dark:text-slate-300 font-medium hidden xl:block max-w-[120px] truncate">
 {currentUser.name.split(" ")[0]}
 </span>
 </div>
 )}

 {!currentUser && (
 <div className="flex items-center gap-1 text-sm text-slate-400">
 <UserIcon className="h-4 w-4" />
 <span>Visitante</span>
 </div>
 )}
 </div>
 </header>

 {/* Main content */}
 <main
 className={`pt-16 transition-all duration-300 ${isCollapsed ? "md:pl-20" : "md:pl-64"}`}
 >
 <div className="p-4 md:p-8">{children}</div>
 </main>
 </div>
 );
}
