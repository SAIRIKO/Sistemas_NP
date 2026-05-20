"use client";

import { useParams } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { ProposalCard } from "@/components/ProposalCard";
import { User, ArrowLeft, BookOpen, Clock, CheckCircle2, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function CoordenadorProfilePage() {
 const params = useParams();
 const { proposals, coordinatorProfiles } = useAppContext();
 
 const rawName = params.name as string;
 const coordinatorName = decodeURIComponent(rawName);

 // Filter proposals where this person is the main coordinator or one of the course coordinators
 const relatedProposals = proposals.filter(p => {
 const isMain = p.coordinator.toLowerCase() === coordinatorName.toLowerCase();
 const isSecondary = p.courseCoordinators?.toLowerCase().includes(coordinatorName.toLowerCase());
 return isMain || isSecondary;
 });

 const profile = coordinatorProfiles?.find(p => p.name.toLowerCase() === coordinatorName.toLowerCase());

 const approvedCount = relatedProposals.filter(p => p.status === 'Aprovado').length;
 const inProgressCount = relatedProposals.filter(p => p.status === 'Em análise').length;

 return (
 <div className="space-y-6 max-w-5xl mx-auto pb-12">
 <Link href="/coordenadores" className="flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors">
 <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para coordenadores
 </Link>

 <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
 <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
 <User className="w-12 h-12" />
 </div>
 <div className="flex-1">
 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{coordinatorName}</h1>
 <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest text-xs font-bold">
 Perfil do Coordenador Acadêmico {profile?.isCurrentCoordinator ? '— Unyleya' : ''}
 </p>
 
 {profile && (
 <div className="flex flex-wrap gap-4 mt-3">
 {profile.email && (
 <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
 <Mail className="w-4 h-4 text-slate-400" />
 <a href={`mailto:${profile.email}`} className="hover:text-blue-600">{profile.email}</a>
 </div>
 )}
 {profile.phone && (
 <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
 <Phone className="w-4 h-4 text-slate-400" />
 <span>{profile.phone}</span>
 </div>
 )}
 </div>
 )}
 
 <div className="flex flex-wrap gap-4 mt-6">
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
 <BookOpen className="w-4 h-4 text-blue-500" />
 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{relatedProposals.length} Projetos</span>
 </div>
 <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
 <span className="text-sm font-medium text-emerald-700">{approvedCount} Aprovados</span>
 </div>
 <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
 <Clock className="w-4 h-4 text-blue-500" />
 <span className="text-sm font-medium text-blue-700">{inProgressCount} Em Análise</span>
 </div>
 </div>
 </div>
 </div>

 {profile?.bio && (
 <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Minibiografia</h2>
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
 </div>
 )}

 <div className="space-y-4">
 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 px-1">Propostas Associadas</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {relatedProposals.map(p => (
 <ProposalCard key={p.id} proposal={p} />
 ))}
 {relatedProposals.length === 0 && (
 <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
 Nenhuma proposta encontrada para este coordenador.
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
