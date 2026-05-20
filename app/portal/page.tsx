"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { BookOpen, Stethoscope, ArrowRight, LogOut, Users } from "lucide-react";

const PORTALS = [
 {
 id: "cp",
 href: "/",
 label: "Central de Propostas",
 description: "Gestão de propostas acadêmicas, pipeline, coordenadores e métricas para cursos gerais da Unyleya.",
 icon: BookOpen,
 accent: "from-blue-600 to-indigo-700",
 ring: "hover:ring-blue-400",
 bg: "bg-blue-50",
 iconBg: "bg-blue-600",
 tag: "Unyleya Educacional",
 tagColor: "bg-blue-100 text-blue-700",
 },
  {
    id: "ymed",
    href: "/ymed",
    label: "Central YMed",
    description: "Gestão de propostas e cursos da Unyleya Med. Pipeline médico, métricas de matrículas e portfólio de cursos.",
    icon: Stethoscope,
    accent: "from-rose-600 to-red-700",
    ring: "hover:ring-rose-400",
    bg: "bg-rose-50",
    iconBg: "bg-rose-600",
    tag: "Unyleya Med",
    tagColor: "bg-rose-100 text-rose-700",
  },
  {
    id: "admin",
    href: "/admin",
    label: "Gestão de Acessos",
    description: "Controle de usuários, hierarquia de permissões e liberação de acesso aos portais.",
    icon: Users,
    accent: "from-amber-500 to-orange-600",
    ring: "hover:ring-amber-400",
    bg: "bg-amber-50",
    iconBg: "bg-amber-500",
    tag: "Acesso Restrito",
    tagColor: "bg-amber-100 text-amber-700",
    adminOnly: true,
  },
];

export default function PortalPage() {
  const router = useRouter();
  const { currentUser, logout, getEffectivePermissions } = useAppContext();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const perms = currentUser ? getEffectivePermissions(currentUser.id) : null;

  const visiblePortals = PORTALS.filter(p => {
    if (p.adminOnly) return currentUser?.role === 'Admin';
    if (!perms?.portals) return false;
    return !!perms.portals[p.id as keyof typeof perms.portals];
  });

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
 {/* Background blobs */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
 <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl" />
 </div>

 <div className="relative w-full max-w-4xl">
 {/* Header */}
 <div className="text-center mb-12">
 <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
 <span className="text-sm text-slate-300 font-medium">Sistema Unyleya</span>
 </div>
 <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
 Selecione o Portal
 </h1>
 {currentUser && (
 <p className="text-slate-400">
 Bem-vindo, <span className="text-white font-semibold">{currentUser.name.split(" ")[0]}</span>. Qual interface deseja acessar?
 </p>
 )}
 </div>

  {/* Portal cards */}
  <div className={`grid grid-cols-1 gap-6 w-full ${
    visiblePortals.length === 1 
      ? 'max-w-md mx-auto' 
      : visiblePortals.length === 2 
        ? 'md:grid-cols-2 max-w-3xl mx-auto' 
        : 'md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'
  }`}>
 {visiblePortals.map((portal) => {
 const Icon = portal.icon;
 return (
 <button
 key={portal.id}
 onClick={() => router.push(portal.href)}
 className={`group relative text-left bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ring-2 ring-transparent ${portal.ring} cursor-pointer`}
 >
 {/* Gradient bar top */}
 <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${portal.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />

 {/* Icon */}
 <div className={`w-16 h-16 ${portal.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
 <Icon className="w-8 h-8 text-white" />
 </div>

 {/* Content */}
 <div className="mb-6">
 <div className="flex items-center gap-3 mb-2">
 <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{portal.label}</h2>
 <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${portal.tagColor}`}>
 {portal.tag}
 </span>
 </div>
 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
 {portal.description}
 </p>
 </div>

 {/* CTA */}
 <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
 <span>Acessar portal</span>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </div>
 </button>
 );
 })}
 </div>

 {/* Footer */}
 <div className="mt-10 flex items-center justify-center gap-6">
 <button
 onClick={handleLogout}
 className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Sair da conta
 </button>
 <span className="text-slate-700 dark:text-slate-200">•</span>
 <span className="text-sm text-slate-600 dark:text-slate-300">Unyleya Educacional © 2026</span>
 </div>
 </div>
 </div>
 );
}
