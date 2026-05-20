import { NextRequest, NextResponse } from 'next/server';
import { getCardPhaseFields } from '@/lib/services/pipefy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const phaseData = await getCardPhaseFields(id);

    return NextResponse.json({ success: true, data: phaseData });
  } catch (error: any) {
    console.error('Erro ao buscar campos da fase:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
