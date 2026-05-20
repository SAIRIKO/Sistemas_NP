"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { IaLaunchModal } from "./IaLaunchModal";
import { IaChatPopup } from "./IaChatPopup";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex relative overflow-hidden">
 <div className="relative z-10 flex w-full">
 <Sidebar 
 isOpen={isMobileMenuOpen} 
 setIsOpen={setIsMobileMenuOpen} 
 isCollapsed={isSidebarCollapsed}
 setIsCollapsed={setIsSidebarCollapsed}
 />
 <div className={`flex-col flex-1 pl-0 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
 <Header onMenuToggle={() => setIsMobileMenuOpen(true)} isSidebarCollapsed={isSidebarCollapsed} />
 <main className="p-4 md:p-8 mt-16 min-h-[calc(100vh-4rem)]">
 {children}
 </main>
 </div>
 </div>
 <IaLaunchModal />
 <IaChatPopup />
 </div>
 );
}
