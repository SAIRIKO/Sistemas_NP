import { Badge } from "@/components/ui/badge";
import { Risk, Status } from "@/lib/types";

export function RiskBadge({ risk }: { risk?: Risk }) {
 if (!risk) return null;
 const colors = {
 alto: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
 médio: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
 baixo: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
 };
 return <Badge variant="outline" className={`${colors[risk]} capitalize`}>{risk} Risco</Badge>;
}

export function StatusBadge({ status }: { status: Status }) {
 const map: Record<Status, { label: string; cls: string }> = {
 'Em análise': { label: "Em Análise", cls: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100" },
 'Recebendo Proposta': { label: "Recebendo Proposta", cls: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100" },
 'Aprovado': { label: "Aprovado", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100" },
 'Reprovado': { label: "Reprovado", cls: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100" },
 'Standby': { label: "Stand By", cls: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800" }
 };
 return <Badge variant="outline" className={`${map[status]?.cls || "bg-gray-100"}`}>{map[status]?.label || status}</Badge>;
}
