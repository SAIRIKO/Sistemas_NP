"use client";

import { useParams } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, RiskBadge } from "@/components/Badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Calendar, History, Paperclip, MessageSquare, Check, Save, FileText, Download, Video, PlayCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function parseDisciplines(text: string) {
 if (!text || text === 'Não definidas') return [];
 const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
 
 const results: any[] = [];
 
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i];

 // Verifica se a linha é um CH isolado (ex: 40h, 60h, 40)
 const isStandaloneCH = /^\d+\s*(h|hr|hrs|horas?)?$/i.test(line);
 // Verifica se a linha é um Tipo isolado
 const isStandaloneType = /^(nova|aproveitamento|atualização|atualizacao|mantida|excluída|excluida|nova disciplina)$/i.test(line);

 if ((isStandaloneCH || isStandaloneType) && results.length > 0) {
 const last = results[results.length - 1];
 if (isStandaloneCH) last.ch = line;
 if (isStandaloneType) last.type = line;
 } else {
 // Caso contrário, é o nome de uma disciplina nova (podendo conter atributos embutidos)
 let name = line;
 let ch = '-';
 let type = '-';

 // 1. Tentar extrair CH com "h", "hr", "horas" via Regex (ex: 40h)
 const chMatch = line.match(/(\d+)\s*(h|hr|hrs|horas?)(?!\w)/i);
 if (chMatch) {
 ch = chMatch[0];
 name = line.replace(chMatch[0], '').trim();
 } else {
 // 2. Procurar por uma CH puramente numérica separada por traço ou pipe (ex: Nome - 40 - Nova)
 const parts = line.split(/[-–|]/).map(p => p.trim()).filter(Boolean);
 const numPartIdx = parts.findIndex(p => /^\d+$/.test(p));
 
 if (numPartIdx > 0) { // Se achou um número solto que não é a primeira palavra
 ch = parts[numPartIdx];
 parts.splice(numPartIdx, 1); // remove o número
 
 if (parts.length > 1) {
 type = parts.pop()!;
 name = parts.join(' - ');
 } else {
 name = parts[0] || line;
 }
 }
 }

 // Se ainda não temos Tipo e a CH foi extraída via Regex, tentar extrair Tipo
 if (ch !== '-' && type === '-') {
 const dashParts = name.split(/[-–|]/).map(p => p.trim()).filter(Boolean);
 if (dashParts.length > 1) {
 const last = dashParts.pop()!;
 if (last.length < 25) {
 type = last;
 name = dashParts.join(' - ');
 }
 }
 }

 // Se nem CH nem Tipo foram encontrados e temos separadores, tentar último termo como Tipo
 if (ch === '-' && type === '-') {
 const dashParts = name.split(/[-–|]/).map(p => p.trim()).filter(Boolean);
 if (dashParts.length > 1) {
 const last = dashParts.pop()!;
 if (last.length < 25) {
 type = last;
 name = dashParts.join(' - ');
 }
 }
 }

 // Limpar pontuações e parênteses vazios ou desnecessários no nome
 name = name.replace(/^[-\|,\(\)]+|[-\|,\(\)]+$/g, '').trim();
 name = name.replace(/\(\s*\)/g, '').trim(); // remove ()
 if (!name) name = line;

 results.push({ id: `disc-${i}`, name, ch, type });
 }
 }

 return results;
}

function parseSimilarCourses(text?: string, existing?: any[]) {
 const list = [...(existing || [])];
 if (!text || text.toLowerCase() === 'não definido') return list;

 // Agrupar por quebra de linha dupla (parágrafos). 
 // Isso resolve o problema de múltiplas linhas pertencerem ao mesmo curso.
 const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0 && !b.startsWith('[Curso'));
 
 blocks.forEach((block, idx) => {
 const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
 const firstLine = lines[0] || '';
 
 // Tenta encontrar porcentagem em qualquer lugar do bloco
 let similarityPercent = 0;
 const percentMatch = block.match(/(\d+(\.\d+)?)%/);
 if (percentMatch) {
 similarityPercent = parseFloat(percentMatch[1]);
 }

 const parts = firstLine.split(/[-–|]/).map(p => p.trim());
 let courseName = parts[0];
 let situation = parts[1] || 'N/A';
 let coordinator = parts[2] || 'N/A';

 // Ignorar blocos que são apenas cabeçalhos vazios ou informativos (ex: 🔍 Cursos Similares Encontrados)
 if (courseName.toLowerCase().includes('cursos similares encontrados') || courseName.includes('🔍')) {
 return;
 }

 // Se a primeira linha não tinha separadores, tenta procurar as infos nas outras linhas
 if (parts.length === 1 && lines.length > 1) {
 lines.forEach(l => {
 const lower = l.toLowerCase();
 if (lower.includes('situaç') || lower.includes('status')) {
 situation = l.split(/[:\-]/)[1]?.trim() || l;
 }
 if (lower.includes('coord')) {
 coordinator = l.split(/[:\-]/)[1]?.trim() || l;
 }
 });
 } else {
 if (situation.includes('%')) situation = 'N/A';
 if (coordinator.includes('%')) coordinator = 'N/A';
 }

 // O comentário será o restante do bloco (mantendo as quebras de linha para ficar claro)
 const comment = lines.length > 1 ? lines.slice(1).join('\n') : block;

 list.push({
 id: `parsed-${idx}`,
 proposalId: '',
 courseName,
 situation,
 coordinator,
 similarityPercent,
 comment,
 relationType: 'Análise Manual'
 });
 });

 return list;
}

export default function PropostaDetailPage() {
 const params = useParams();
 const { proposals, role } = useAppContext();
 
 const proposalId = params.id as string;
 const proposal = proposals.find(p => p.id === proposalId);

 const [courseCoords, setCourseCoords] = useState(proposal?.courseCoordinators || "");
 const [isSaved, setIsSaved] = useState(false);

 if (!proposal) {
 return <div>Proposta não encontrada</div>;
 }

 const isReservasPhase = proposal.currentPhase === 'Reservas Aprovadas (INSBE)' || proposal.currentPhase === 'Reservas Aprovadas';

 const handleSaveCoordinators = () => {
 // In a real app we'd call an API here
 setIsSaved(true);
 setTimeout(() => setIsSaved(false), 3000);
 };

 return (
 <div className="space-y-6 max-w-6xl mx-auto pb-12">
 <Link href="/propostas" className="flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors">
 <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para propostas
 </Link>

 {/* 1. CABEÇALHO */}
 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
 <div className="flex justify-between items-start mb-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{proposal.courseName}</h1>
 <div className="flex gap-4 text-slate-500 dark:text-slate-400 mt-2 text-sm items-center">
 <span className="flex items-center gap-1"><User className="w-4 h-4" /> {proposal.coordinator}</span>
 <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(proposal.requestDate), 'dd/MM/yyyy')}</span>
 <span>{proposal.area} • {proposal.subarea} • {proposal.vertical}</span>
 </div>
 </div>
 <div className="flex flex-col items-end gap-2">
 <Badge variant="outline" className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 h-7 border-slate-300 dark:border-slate-700">{proposal.currentPhase}</Badge>
 <StatusBadge status={proposal.status} />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 {/* 2. RESUMO EXECUTIVO */}
 <Card className="shadow-sm">
 <CardHeader><CardTitle className="text-lg">Resumo Executivo</CardTitle></CardHeader>
 <CardContent className="space-y-4">
 {/* CAMPO DE COORDENADORES - CONDICIONAL */}
 <div className={`p-4 rounded-lg border-2 transition-all ${isReservasPhase ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
 <User className="w-4 h-4 text-blue-600" />
 Coordenadores que coordenarão os cursos
 </h4>
 
 {courseCoords ? (
 <div className="flex flex-wrap gap-3 mt-3">
 {courseCoords.split(',').map((name, i) => (
 <Link 
 key={i} 
 href={`/coordenadores/${encodeURIComponent(name.trim())}`}
 className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
 >
 <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
 <User className="w-5 h-5" />
 </div>
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name.trim()}</span>
 </Link>
 ))}
 </div>
 ) : (
 <p className="text-sm text-slate-400 italic mt-2">
 Nenhum coordenador definido no Pipefy para esta proposta.
 </p>
 )}

 {isReservasPhase && (
 <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
 <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mb-2">Ação Sugerida (Fase de Reservas)</p>
 <div className="flex gap-2">
 <Input 
 value={courseCoords} 
 onChange={(e) => setCourseCoords(e.target.value)}
 placeholder="Adicionar/Editar coordenadores (João, Maria...)"
 className="h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
 />
 <Button onClick={handleSaveCoordinators} size="sm" className="bg-blue-600 hover:bg-blue-700">
 {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
 </Button>
 </div>
 </div>
 )}
 </div>

 <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
 
 <div>
 <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Público Alvo</h4>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{proposal.targetAudience || 'Não definido'}</p>
 </div>
 <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
 <div>
 <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Disciplinas da Proposta</h4>
 {(!proposal.disciplines || proposal.disciplines === 'Não definidas') ? (
 <p className="text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma disciplina cadastrada.</p>
 ) : (
 <div className="rounded-md border overflow-hidden">
 <Table>
 <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
 <TableRow>
 <TableHead className="w-[60%]">Disciplina</TableHead>
 <TableHead className="w-[20%]">CH</TableHead>
 <TableHead className="w-[20%]">Tipo</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {parseDisciplines(proposal.disciplines).map(disc => (
 <TableRow key={disc.id}>
 <TableCell className="font-medium text-slate-700 dark:text-slate-200">{disc.name}</TableCell>
 <TableCell className="text-slate-600 dark:text-slate-300">{disc.ch}</TableCell>
 <TableCell className="text-slate-600 dark:text-slate-300">{disc.type}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </div>
 <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
 <div>
 <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observações</h4>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{proposal.observations || 'Nenhuma observação informada.'}</p>
 </div>
 
 {proposal.preCommitteeOpinion && (
 <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
 <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
 <MessageSquare className="w-4 h-4" /> Parecer Pré-Comitê
 </h4>
 <p className="text-sm text-blue-900/80 mt-2 leading-relaxed">{proposal.preCommitteeOpinion}</p>
 </div>
 )}
 </CardContent>
 </Card>
 
 {/* 3. SIMILARIDADE */}
 <Card className="shadow-sm">
 <CardHeader>
 <div className="flex justify-between items-center">
 <CardTitle className="text-lg">Análise de Similaridade</CardTitle>
 <RiskBadge risk={proposal.cannibalizationRisk} />
 </div>
 </CardHeader>
 <CardContent>
 {(() => {
 const combinedSimilar = parseSimilarCourses(proposal.similarCoursesText, proposal.similarCourses);
 
 return combinedSimilar.length > 0 ? (
 <div className="grid gap-4">
 <div className="text-sm mb-2 text-slate-600 dark:text-slate-300">Encontrados <strong>{combinedSimilar.length}</strong> cursos com aderência ao tema proposto.</div>
 {combinedSimilar.map(sim => (
 <div key={sim.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-slate-300 dark:border-slate-700 transition-colors">
 <div className="flex justify-between items-center mb-3">
 <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-base">{sim.courseName} <span className="font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2 text-sm">{sim.similarityPercent}%</span></h4>
 <Badge variant="secondary" className="capitalize text-slate-600 dark:text-slate-300">{sim.relationType}</Badge>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3"><span className="font-semibold text-slate-700 dark:text-slate-200">Comentário Estratégico:</span> {sim.comment}</p>
 <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
 <span className="font-medium text-slate-600 dark:text-slate-300">Situação: {sim.situation}</span>
 <span>Coord: {sim.coordinator}</span>
 {sim.g2Id && <span>G2 ID: {sim.g2Id}</span>}
 {sim.workload && <span>Carga: {sim.workload}h</span>}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-8 text-center text-slate-400 border-2 border-dashed rounded-lg">
 Nenhum curso similar encontrado para análise.
 </div>
 );
 })()}
 </CardContent>
 </Card>
 </div>

 <div className="space-y-6">
 {/* COLUNA DIREITA: Anexos, Ações e Votação */}
 
 {/* 7. VOTAÇÃO (se no comitê) */}
 {(proposal.currentPhase === 'Comitê' || proposal.currentPhase === 'Aguardando Comitê') && (
 <Card className="border-emerald-200 shadow-sm overflow-hidden">
 <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
 <CardTitle className="text-emerald-800 text-lg">Votação Comitê</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 {isSaved ? (
 <div className="flex flex-col items-center justify-center py-8 text-emerald-600 animate-in fade-in zoom-in duration-300">
 <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
 <Check className="w-6 h-6" />
 </div>
 <p className="font-bold">Voto Registrado!</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aguardando consolidação.</p>
 </div>
 ) : role === 'Diretor' ? (
 <div className="flex flex-col gap-3">
 <button onClick={handleSaveCoordinators} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors cursor-pointer">Aprovar Proposta</button>
 <button onClick={handleSaveCoordinators} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors cursor-pointer">Reprovar Proposta</button>
 <button onClick={handleSaveCoordinators} className="w-full py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md font-medium transition-colors cursor-pointer">Colocar em Stand By</button>
 </div>
 ) : (
 <div className="flex flex-col gap-4">
 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border rounded-lg text-sm text-slate-600 dark:text-slate-300">
 Consolidação visível para Admin. Os diretores estão registrando os votos.
 </div>
 <button onClick={handleSaveCoordinators} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">Consolidar Votação Final</button>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 <Card className="shadow-sm">
 <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
 <CardTitle className="text-lg flex items-center gap-2"><Paperclip className="w-4 h-4" /> Anexos da Proposta</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="flex flex-col gap-2">
 {!proposal.pptUrl && !proposal.videoUrl ? (
 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-dashed rounded-lg text-center">
 <p className="text-sm text-slate-400">Nenhum anexo disponível para esta proposta.</p>
 </div>
 ) : (
 <>
 {proposal.pptUrl && (
 <a href={proposal.pptUrl} download className="w-full flex justify-between items-center p-3 border rounded-md hover:bg-orange-50 transition-colors cursor-pointer group">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100">
 <FileText className="w-4 h-4" />
 </div>
 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Apresentação Executiva.pptx</span>
 </div>
 <span className="text-xs text-orange-600 font-semibold underline flex items-center gap-1"><Download className="w-3 h-3" /> Baixar</span>
 </a>
 )}
 {proposal.videoUrl && (
 <Dialog>
 <DialogTrigger className="w-full flex justify-between items-center p-3 border rounded-md hover:bg-blue-50 transition-colors cursor-pointer group">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
 <Video className="w-4 h-4" />
 </div>
 <div className="text-left">
 <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1" title="Vídeo de Apresentação">Vídeo de Apresentação</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">Video MP4</p>
 </div>
 </div>
 <span className="text-xs text-blue-600 font-semibold underline flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Assistir</span>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none">
 <video src={proposal.videoUrl} controls className="w-full h-auto max-h-[80vh]" autoPlay />
 </DialogContent>
 </Dialog>
 )}
 </>
 )}
 </div>
 </CardContent>
 </Card>
 
 <Card className="shadow-sm">
 <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
 <CardTitle className="text-lg flex items-center gap-2"><History className="w-4 h-4" /> Histórico</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
 {/* Mocked History Item */}
 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
 <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 dark:text-slate-400 group-[.is-active]:text-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
 </div>
 <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-odd:pr-4">
 <time className="text-xs font-medium text-slate-500 dark:text-slate-400">{format(new Date(proposal.updatedAt), 'dd/MM/yyyy HH:mm')}</time>
 <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">Status atualizado para {proposal.currentPhase}</div>
 </div>
 </div>
 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
 <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
 <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-odd:pr-4">
 <time className="text-xs font-medium text-slate-500 dark:text-slate-400 opacity-70">{format(new Date(proposal.createdAt), 'dd/MM/yyyy HH:mm')}</time>
 <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Proposta Criada no Pipefy</div>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
