"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface CsvColumn {
 key: string;
 label: string;
}

interface CsvExportModalProps {
 open: boolean;
 onClose: () => void;
 columns: CsvColumn[];
 rows: Record<string, string | number>[];
 filename?: string;
}

export function CsvExportModal({ open, onClose, columns, rows, filename = "export" }: CsvExportModalProps) {
 const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set(columns.map(c => c.key)));
 const [copied, setCopied] = useState(false);

 const toggleCol = (key: string) => {
 setSelectedCols(prev => {
 const next = new Set(prev);
 if (next.has(key)) {
 if (next.size === 1) return prev; // mínimo 1 coluna
 next.delete(key);
 } else {
 next.add(key);
 }
 return next;
 });
 };

 const activeCols = columns.filter(c => selectedCols.has(c.key));

 const buildCsvContent = () => {
 const header = activeCols.map(c => `"${c.label}"`).join(",");
 const body = rows.map(row =>
 activeCols.map(c => `"${row[c.key] ?? ""}"`).join(",")
 ).join("\n");
 return `${header}\n${body}`;
 };

 const handleDownload = () => {
 const csv = buildCsvContent();
 const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `${filename}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 toast.success("CSV baixado com sucesso!");
 onClose();
 };

 const handleCopy = () => {
 const tsv = [
 activeCols.map(c => c.label).join("\t"),
 ...rows.map(row => activeCols.map(c => row[c.key] ?? "").join("\t")),
 ].join("\n");
 navigator.clipboard.writeText(tsv).then(() => {
 setCopied(true);
 toast.success("Tabela copiada para a área de transferência!");
 setTimeout(() => setCopied(false), 2000);
 });
 };

 return (
 <Dialog open={open} onOpenChange={onClose}>
 <DialogContent className="max-w-4xl p-0 overflow-hidden" showCloseButton={false}>
 <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
 {/* Header */}
 <div className="px-6 py-5 border-b bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Exportar Dados</h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Selecione as colunas desejadas antes de baixar ou copiar.</p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
 <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
 {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
 Copiar
 </Button>
 <Button size="sm" onClick={handleDownload} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
 <Download className="h-4 w-4" />
 Baixar CSV
 </Button>
 </div>
 </div>

 {/* Column toggles */}
 <div className="px-6 py-4 border-b bg-white dark:bg-slate-800">
 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Colunas visíveis</p>
 <div className="flex flex-wrap gap-2">
 {columns.map(col => {
 const active = selectedCols.has(col.key);
 return (
 <button
 key={col.key}
 onClick={() => toggleCol(col.key)}
 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
 active
 ? "bg-rose-50 border-rose-200 text-rose-700"
 : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400"
 }`}
 >
 <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${
 active ? "bg-rose-600 border-rose-600" : "border-slate-300 dark:border-slate-700"
 }`}>
 {active && <Check className="w-2 h-2 text-white" />}
 </span>
 {col.label}
 </button>
 );
 })}
 </div>
 </div>

 {/* Preview table */}
 <div className="overflow-auto max-h-[420px]">
 <table className="w-full text-sm">
 <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
 <tr>
 {activeCols.map(col => (
 <th key={col.key} className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap border-b">
 {col.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {rows.map((row, i) => (
 <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-800/50/50"}>
 {activeCols.map(col => (
 <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap border-b border-slate-100 dark:border-slate-700">
 {row[col.key] ?? "—"}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 {rows.length === 0 && (
 <div className="py-12 text-center text-slate-400 text-sm">
 Nenhum dado disponível para exportar.
 </div>
 )}
 </div>

 <div className="px-6 py-3 border-t bg-slate-50 dark:bg-slate-800/50">
 <p className="text-xs text-slate-400">{rows.length} registros · {activeCols.length} colunas selecionadas</p>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
