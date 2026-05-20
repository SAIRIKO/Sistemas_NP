import { NextRequest, NextResponse } from 'next/server';
import { moveCardToPhase } from '@/lib/services/pipefy';

const PHASE_MAP: Record<string, string> = {
  "Solicitações": "333225219",
  "Revisão": "333225222",
  "Aguardando aprovação": "333225223",
  "Reservas Aprovadas (INSBE)": "342935653",
  "Reservas Aprovadas": "333225220",
  "(Controle Interno) Inserir Performance": "333286960",
  "Pré-Comitê": "339377838",
  "Aguardando Comitê": "342715534",
  "Comitê": "333225221",
  "Stand By": "340276437",
  "Propostas Aprovadas": "333328373",
  "Reprovados": "333296732"
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { targetPhase } = await req.json();
    const phaseId = PHASE_MAP[targetPhase];

    if (!phaseId) {
      return NextResponse.json({ error: 'Fase de destino inválida' }, { status: 400 });
    }

    const updatedCard = await moveCardToPhase(id, phaseId);

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error: any) {
    console.error('Erro na movimentação do card:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
