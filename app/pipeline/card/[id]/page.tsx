"use client";

import { useAppContext } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChevronLeft, Save, Loader2, Play, Download, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PipefyCardPhaseData, PipefyFieldDef } from "@/lib/services/pipefy";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PipelineCardPage() {
 const params = useParams();
 const id = params.id as string;
 const router = useRouter();
 
 const { proposals } = useAppContext();
 const proposal = proposals.find(p => p.id === id);

 const { data, isLoading, mutate } = useSWR<{ success: boolean; data: PipefyCardPhaseData }>(
 `/api/pipefy/cards/${id}/phase-fields`, 
 fetcher
 );

 const [formData, setFormData] = useState<Record<string, string>>({});
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
 if (data?.data) {
 const initialData: Record<string, string> = {};
 data.data.current_phase.fields.forEach(f => {
 // Find current value in the card fields
 const currentField = data.data.fields.find(cf => cf.field.id === f.id);
 if (currentField) {
 initialData[f.id] = typeof currentField.value === 'string' ? currentField.value : JSON.stringify(currentField.value);
 } else {
 initialData[f.id] = "";
 }
 });
 setFormData(initialData);
 }
 }, [data]);

 if (!proposal) {
 return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Proposta não encontrada.</div>;
 }

 const handleChange = (fieldId: string, value: string) => {
 setFormData(prev => ({ ...prev, [fieldId]: value }));
 };

 const handleSave = async () => {
 if (!data?.data) return;
 
 setIsSaving(true);
 const loadingId = toast.loading("Salvando alterações no Pipefy...");
 
 try {
 const fieldsToUpdate = data.data.current_phase.fields;
 
 const promises = fieldsToUpdate.map(async (f) => {
 const currentField = data.data.fields.find(cf => cf.field.id === f.id);
 const originalValue = currentField?.value || "";
 const newValue = formData[f.id];

 // Ignorar upload de arquivos para Pipefy nesta versão (exige pre-signed S3 urls)
 if (f.type === 'attachment') return;

 // Só atualiza se mudou
 if (newValue !== originalValue) {
 const res = await fetch(`/api/pipefy/cards/${id}/update-field`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ fieldId: f.id, newValue })
 });
 if (!res.ok) throw new Error(`Falha ao salvar campo ${f.label}`);
 }
 });

 await Promise.all(promises);
 toast.success("Alterações salvas com sucesso!", { id: loadingId });
 mutate(); // Recarrega os dados do Pipefy para garantir sync
 } catch (error: any) {
 console.error(error);
 toast.error(error.message || "Erro ao salvar", { id: loadingId });
 } finally {
 setIsSaving(false);
 }
 };

 const renderField = (field: PipefyFieldDef) => {
 const val = formData[field.id] || "";
 
 // Tratamento para JSON Arrays (Múltipla escolha vindos do Pipefy às vezes chegam como "[\"A\", \"B\"]")
 let displayVal = val;
 if (val.startsWith("[") && val.endsWith("]")) {
 try {
 const parsed = JSON.parse(val);
 displayVal = Array.isArray(parsed) ? parsed[0] : val;
 } catch {
 // ignore
 }
 }

 switch (field.type) {
 case 'long_text':
 return (
 <Textarea 
 value={displayVal} 
 onChange={(e) => handleChange(field.id, e.target.value)} 
 placeholder={field.description || "Digite o texto aqui..."}
 className="min-h-[120px]"
 />
 );
 case 'radio_horizontal':
 case 'radio_vertical':
 return (
 <RadioGroup value={displayVal} onValueChange={(v) => handleChange(field.id, v)} className="flex flex-col gap-2 mt-2">
 {field.options.map(opt => (
 <div key={opt} className="flex items-center space-x-2">
 <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
 <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
 </div>
 ))}
 </RadioGroup>
 );
 case 'select':
 return (
 <Select value={displayVal} onValueChange={(v) => handleChange(field.id, v)}>
 <SelectTrigger>
 <SelectValue placeholder="Selecione uma opção" />
 </SelectTrigger>
 <SelectContent>
 {field.options.map(opt => (
 <SelectItem key={opt} value={opt}>{opt}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 );
 case 'statement':
 return (
 <div 
 className="prose prose-sm prose-slate max-w-none p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-slate-700 dark:text-slate-200"
 dangerouslySetInnerHTML={{ __html: field.description || field.label }}
 />
 );
 case 'attachment':
 const isVideo = val.toLowerCase().includes('.mp4') || val.toLowerCase().includes('video');
 const hasUrl = val.startsWith('http') || val.startsWith('[');
 let actualUrl = val;

 if (val.startsWith('[')) {
 try {
 const parsed = JSON.parse(val);
 if (Array.isArray(parsed) && parsed.length > 0) actualUrl = parsed[0];
 } catch {}
 }

 return (
 <div className="flex flex-col gap-3 mt-1">
 <div className="relative group">
 <input 
 type="file" 
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
 onChange={(e) => {
 toast.info("Arquivo selecionado localmente. (Upload real requer integração S3 do Pipefy)");
 }}
 />
 <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
 <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform">
 <Plus className="h-5 w-5" />
 </div>
 <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-blue-700">Clique para selecionar ou arraste o arquivo</span>
 <span className="text-xs text-slate-400 mt-1">Qualquer formato é aceito no momento</span>
 </div>
 </div>
 
 {hasUrl && actualUrl.startsWith('http') && (
 <div className="flex gap-2 items-center">
 {isVideo ? (
 <Dialog>
 <DialogTrigger render={<Button variant="secondary" className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100" />}>
 <Play className="h-4 w-4" /> Assistir Vídeo Atual
 </DialogTrigger>
 <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none">
 <video src={actualUrl} controls className="w-full h-auto max-h-[80vh]" autoPlay />
 </DialogContent>
 </Dialog>
 ) : (
 <Button variant="secondary" className="gap-2" onClick={() => window.open(actualUrl, '_blank')}>
 <Download className="h-4 w-4" /> Baixar Arquivo Atual
 </Button>
 )}
 </div>
 )}
 </div>
 );
 default:
 // Input padrão para short_text ou outros tipos
 return (
 <Input 
 value={displayVal} 
 onChange={(e) => handleChange(field.id, e.target.value)}
 placeholder={field.description || "Digite aqui..."}
 />
 );
 }
 };

 return (
 <div className="max-w-4xl mx-auto space-y-6 pb-24">
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" onClick={() => router.back()}>
 <ChevronLeft className="h-5 w-5" />
 </Button>
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{proposal.courseName}</h2>
 <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
 <span>{proposal.coordinator}</span>
 <span>•</span>
 <span className="font-semibold">{proposal.currentPhase}</span>
 </p>
 </div>
 </div>

 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 border-b pb-4">
 Campos da Fase: {proposal.currentPhase}
 </h3>

 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
 <span className="ml-3 text-slate-500 dark:text-slate-400">Carregando campos do Pipefy...</span>
 </div>
 ) : !data?.data?.current_phase?.fields?.length ? (
 <div className="text-center py-12 text-slate-500 dark:text-slate-400">
 Nenhum campo configurado para edição nesta fase.
 </div>
 ) : (
 <div className="space-y-6">
 {data.data.current_phase.fields.map(field => {
 if (field.type === 'statement') {
 return (
 <div key={field.id} className="mb-6">
 {renderField(field)}
 </div>
 );
 }

 return (
 <div key={field.id} className="space-y-2">
 <Label className="text-base font-semibold text-slate-700 dark:text-slate-200">
 {field.label} {field.required && <span className="text-red-500">*</span>}
 </Label>
 {field.description && (
 <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{field.description}</p>
 )}
 {renderField(field)}
 </div>
 );
 })}
 
 <div className="pt-6 border-t mt-8 flex justify-end">
 <Button onClick={handleSave} disabled={isSaving} className="gap-2">
 {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
 Salvar Alterações
 </Button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
