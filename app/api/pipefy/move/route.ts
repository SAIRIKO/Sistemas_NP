import { NextRequest, NextResponse } from 'next/server';
import { moveCardToPhase } from '@/lib/services/pipefy';

export async function POST(req: NextRequest) {
  const body = await req.json() as { cardId?: string; destinationPhaseId?: string };
  const { cardId, destinationPhaseId } = body;

  if (!cardId || !destinationPhaseId) {
    return NextResponse.json({ error: 'cardId e destinationPhaseId são obrigatórios' }, { status: 400 });
  }

  try {
    const card = await moveCardToPhase(cardId, destinationPhaseId);
    return NextResponse.json({ ok: true, card });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
