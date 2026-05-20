import { NextRequest, NextResponse } from 'next/server';
import { updateCardField } from '@/lib/services/pipefy';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fieldId, newValue } = body;

    if (!id || !fieldId) {
      return NextResponse.json({ error: 'ID do card ou fieldId ausentes' }, { status: 400 });
    }

    const updatedCard = await updateCardField(id, fieldId, newValue);

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error: any) {
    console.error('Erro ao atualizar campo do card:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
