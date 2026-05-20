"use client";

import { useAppContext } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.role !== 'Admin') {
        router.push("/portal");
      }
    }
  }, [currentUser, mounted, router]);

  if (!mounted || !currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Standalone Header for Admin Portal */}
      <header className="h-16 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight">Portal Administrativo</h1>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Unyleya Educacional</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
