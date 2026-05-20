"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Proposal } from "@/lib/types";
import { RiskBadge, StatusBadge } from "./Badges";
import { Calendar, User, Presentation, PlayCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function ProposalCard({ proposal, hrefOverride }: { proposal: Proposal, hrefOverride?: string }) {
 const router = useRouter();

 const handleCardClick = () => {
 router.push(hrefOverride || `/propostas/${proposal.id}`);
 };

 return (
 <div onClick={handleCardClick} className="block mb-3 h-full">
 <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-slate-800 h-full flex flex-col">
 <CardHeader className="p-4 pb-2">
 <div className="flex justify-between items-start gap-2">
 <CardTitle className="text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">{proposal.courseName}</CardTitle>
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
 <User className="h-3 w-3" /> {proposal.coordinator}
 </div>
 </CardHeader>
 <CardContent className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 space-y-2 flex-1">
 <div className="flex justify-between items-center">
 <span>{proposal.area} • {proposal.subarea}</span>
 </div>
 
 <div className="flex flex-wrap gap-2 mt-2">
 <StatusBadge status={proposal.status} />
 {proposal.cannibalizationRisk && <RiskBadge risk={proposal.cannibalizationRisk} />}
 </div>
 
 {proposal.maxSimilarity && (
 <div className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
 Similaridade máx: <span className="text-slate-800 dark:text-slate-100">{proposal.maxSimilarity}%</span>
 </div>
 )}
 </CardContent>
 <CardFooter className="px-4 py-3 border-t bg-slate-50 dark:bg-slate-800/50/50 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center text-xs text-slate-500 dark:text-slate-400 rounded-b-xl leading-none mt-auto">
 <div className="flex items-center gap-1 shrink-0">
 <Calendar className="h-3 w-3" />
 {format(new Date(proposal.requestDate), 'dd/MM/yyyy')}
 </div>
 <div className="flex flex-wrap gap-2">
 {proposal.videoUrl && (
 <div onClick={(e) => e.stopPropagation()}>
 <Dialog>
 <DialogTrigger className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-medium transition-colors cursor-pointer" title="Abrir player de vídeo">
 <PlayCircle className="h-3.5 w-3.5" />
 Assistir
 </DialogTrigger>
 <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none" onClick={(e) => e.stopPropagation()}>
 <video src={proposal.videoUrl} controls className="w-full h-auto max-h-[80vh]" autoPlay />
 </DialogContent>
 </Dialog>
 </div>
 )}
 {proposal.pptUrl && (
 <a
 href={proposal.pptUrl}
 download
 onClick={(e) => e.stopPropagation()}
 className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-md font-medium transition-colors"
 title="Baixar arquivo PPTX"
 >
 <Download className="h-3.5 w-3.5" />
 PPTX
 </a>
 )}
 </div>
 </CardFooter>
 </Card>
 </div>
 );
}
