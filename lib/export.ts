import { Proposal } from "./types";
import { format } from "date-fns";

export function exportToCSV(proposals: Proposal[]) {
  if (!proposals || proposals.length === 0) return;

  const headers = [
    "ID do Card",
    "Nome da Proposta",
    "Coordenador",
    "Área",
    "Fase Atual",
    "Situação",
    "Risco",
    "Última Atualização"
  ];

  const rows = proposals.map(p => [
    p.id,
    p.courseName,
    p.coordinator,
    p.area,
    p.currentPhase,
    p.status,
    p.cannibalizationRisk || "N/A",
    format(new Date(p.updatedAt), 'dd/MM/yyyy HH:mm')
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
  ].join("\n");

  // UTF-8 BOM para garantir que o Excel abra os acentos corretamente
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Propostas_Export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
