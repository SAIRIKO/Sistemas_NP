import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Status } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deriveStatusFromPhase(currentPhase: string, previousStatus?: Status): Status {
  const normPhase = currentPhase.trim().toLowerCase();

  // Fases Herdeiras (fallback para 'Em análise' se não houver previousStatus)
  if (['pré-comitê', 'aguardando comitê', 'comitê'].includes(normPhase)) {
    return previousStatus ?? 'Em análise';
  }

  // Em análise
  if (['solicitações', 'revisão', 'aguardando aprovação'].includes(normPhase)) {
    return 'Em análise';
  }

  // Recebendo Proposta
  if (['reservas aprovadas (insbe)', 'reservas aprovadas', 'reservas'].includes(normPhase)) {
    return 'Recebendo Proposta';
  }

  // Aprovado
  if (normPhase.includes('propostas aprovadas') || normPhase === 'aprovadas') {
    return 'Aprovado';
  }

  // Reprovado
  if (normPhase.includes('reprovados') || normPhase === 'reprovadas') {
    return 'Reprovado';
  }
  
  // Standby
  if (normPhase.includes('stand by') || normPhase === 'standby') {
    return 'Standby';
  }

  return 'Em análise';
}
